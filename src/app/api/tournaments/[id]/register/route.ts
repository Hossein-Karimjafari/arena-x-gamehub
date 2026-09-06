import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bad, apiError, safeJson, firstIssue, ApiError } from "@/lib/api-helpers";
import { tournamentRegisterSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return bad("ابتدا وارد شو", 401);
  if (!rateLimit(clientKey(req, "treg"), 8, 60_000)) return bad("تلاش بیش از حد", 429);
  const { id } = await params;

  try {
    const body = await safeJson<unknown>(req);
    const parsed = tournamentRegisterSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { teamName, contact } = parsed.data;

    const result = await db.$transaction(async (tx) => {
      // Lock-ish: re-read registrations inside the transaction and count.
      const t = await tx.tournament.findUnique({ where: { id }, include: { registrations: { select: { userId: true } } } });
      if (!t) throw new ApiError("مسابقه یافت نشد", 404);
      if (t.status !== "OPEN") throw new ApiError("ثبت‌نام این مسابقه بسته است", 400);
      if (t.registrations.length >= t.capacity) throw new ApiError("ظرفیت تکمیل شده", 400);
      if (t.registrations.some((r) => r.userId === session.user.id)) throw new ApiError("قبلاً ثبت‌نام کرده‌ای", 400);
      if (t.teamSize > 1 && !teamName) throw new ApiError("نام تیم الزامی است", 400);

      // Charge entry fee atomically when > 0.
      let paid = false;
      if (t.entryFee > 0) {
        const dec = await tx.user.updateMany({
          where: { id: session.user.id, balance: { gte: t.entryFee } },
          data: { balance: { decrement: t.entryFee } },
        });
        if (dec.count === 0) throw new ApiError("اعتبار کیف پول برای هزینه ثبت‌نام کافی نیست؛ ابتدا شارژ کن", 400);
        await tx.walletTx.create({ data: { userId: session.user.id, amount: -t.entryFee, type: "PAY", desc: `هزینه ثبت‌نام ${t.title}` } });
        paid = true;
      }

      await tx.tournamentRegistration.create({
        data: { tournamentId: id, userId: session.user.id, teamName: teamName ?? null, contact, paid },
      });

      const count = t.registrations.length + 1;
      if (count >= t.capacity) await tx.tournament.update({ where: { id }, data: { status: "FULL" } });

      await tx.notification.create({
        data: {
          userId: session.user.id, title: `ثبت‌نام مسابقه ${t.title} ✅`,
          body: paid
            ? `ثبت‌نام شما انجام و ${t.entryFee.toLocaleString("fa-IR")} تومان از کیف پول کسر شد. موفق باشی!`
            : "ثبت‌نام شما ثبت شد. قوانین و زمان‌بندی از صفحه مسابقه قابل مشاهده است. موفق باشی!",
        },
      });
      return { paid, entryFee: t.entryFee };
    });

    return NextResponse.json({ ok: true, paid: result.paid, entryFee: result.entryFee });
  } catch (e) {
    return apiError(e);
  }
}
