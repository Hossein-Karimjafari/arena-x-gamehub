import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bad, apiError, ApiError } from "@/lib/api-helpers";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const FREE_CANCEL_HOURS = 3;

function slotStart(date: string, startHour: number) {
  return new Date(`${date}T${String(startHour).padStart(2, "0")}:00:00`);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return bad("ابتدا وارد شو", 401);
  if (!rateLimit(clientKey(req, "cancel"), 10, 60_000)) return bad("تلاش بیش از حد", 429);
  const { id } = await params;

  try {
    const result = await db.$transaction(async (tx) => {
      const b = await tx.booking.findUnique({ where: { id }, include: { station: true } });
      if (!b || b.userId !== session.user.id) throw new ApiError("رزرو یافت نشد", 404);
      if (b.status === "CANCELLED") throw new ApiError("این رزرو قبلاً لغو شده", 400);
      if (b.status === "DONE") throw new ApiError("رزروهای انجام‌شده قابل لغو نیستند", 400);
      if (!["CONFIRMED", "PENDING"].includes(b.status)) throw new ApiError("این رزرو قابل لغو نیست", 400);

      const start = slotStart(b.date, b.startHour);
      const diffH = (start.getTime() - Date.now()) / 3_600_000;
      if (diffH < FREE_CANCEL_HOURS) {
        throw new ApiError(`لغو رایگان فقط تا ${FREE_CANCEL_HOURS} ساعت قبل از شروع رزرو امکان‌پذیر است`, 400);
      }

      const paid = b.payMethod === "wallet" || b.payMethod === "online";
      await tx.booking.update({ where: { id }, data: { status: "CANCELLED" } });
      if (paid && b.totalPrice > 0) {
        await tx.user.update({ where: { id: session.user.id }, data: { balance: { increment: b.totalPrice } } });
        await tx.walletTx.create({ data: { userId: session.user.id, amount: b.totalPrice, type: "REFUND", desc: `بازگشت وجه لغو رزرو ${b.station.name}` } });
      }
      await tx.notification.create({
        data: {
          userId: session.user.id, title: "رزرو لغو شد",
          body: paid
            ? `رزرو ${b.station.name} لغو و مبلغ ${b.totalPrice.toLocaleString("fa-IR")} تومان به کیف پول شما بازگشت.`
            : `رزرو ${b.station.name} لغو شد.`,
        },
      });
      return { refunded: paid && b.totalPrice > 0, amount: b.totalPrice };
    });

    return NextResponse.json({ ok: true, refunded: result.refunded, amount: result.amount });
  } catch (e) {
    return apiError(e);
  }
}
