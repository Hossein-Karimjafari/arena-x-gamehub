import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bad, apiError, safeJson, ApiError } from "@/lib/api-helpers";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return bad("ابتدا وارد شو", 401);
  if (!rateLimit(clientKey(req, "buyplan"), 6, 60_000)) return bad("تلاش بیش از حد", 429);
  try {
    const body = await safeJson<{ planId?: string }>(req);
    const planId = body?.planId?.trim();
    if (!planId) return bad("پلن انتخاب نشده");

    const result = await db.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({ where: { id: planId } });
      if (!plan) throw new ApiError("پلن یافت نشد", 404);
      if (!plan.active) throw new ApiError("این پلن غیرفعال است", 400);

      // Atomic guarded decrement (prevents double-spend race).
      const paid = await tx.user.updateMany({
        where: { id: session.user.id, balance: { gte: plan.price } },
        data: { balance: { decrement: plan.price }, xp: { increment: Math.min(500, Math.max(50, Math.floor(plan.price / 10000))) } },
      });
      if (paid.count === 0) throw new ApiError("اعتبار کیف پول کافی نیست؛ ابتدا شارژ کن", 400);

      // Credit purchased hours (used by staff to honor plan playtime).
      const hours = await tx.userHours.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, remaining: plan.hours, purchased: plan.hours },
        update: { remaining: { increment: plan.hours }, purchased: { increment: plan.hours } },
      });

      await tx.walletTx.create({ data: { userId: session.user.id, amount: -plan.price, type: "PAY", desc: `خرید ${plan.title}` } });
      await tx.notification.create({
        data: { userId: session.user.id, title: "اشتراک فعال شد 💎", body: `${plan.title} با ${plan.hours} ساعت بازی فعال شد. خوش بگذره!` },
      });
      return { hours: plan.hours, remaining: hours.remaining };
    });

    return NextResponse.json({ ok: true, hoursAdded: result.hours, hoursRemaining: result.remaining });
  } catch (e) {
    return apiError(e);
  }
}
