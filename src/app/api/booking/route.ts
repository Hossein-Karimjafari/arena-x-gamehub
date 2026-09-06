import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bad, apiError, safeJson, firstIssue, ApiError } from "@/lib/api-helpers";
import { bookingSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!rateLimit(clientKey(req, "booking"), 10, 60_000)) return bad("تلاش بیش از حد؛ کمی صبر کن", 429);
  try {
    const body = await safeJson<unknown>(req);
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { stationId, date, startHour, hours, payMethod, discountCode, guestName, guestPhone } = parsed.data;

    if (!session && (!guestName || !guestPhone)) {
      return bad("برای رزرو مهمان، نام و موبایل الزامی است");
    }

    const booking = await db.$transaction(async (tx) => {
      const station = await tx.station.findUnique({ where: { id: stationId } });
      if (!station || !station.active) throw new ApiError("دستگاه یافت نشد", 404);

      // Conflict check inside the transaction (all active bookings for that slot).
      const existing = await tx.booking.findMany({
        where: { stationId, date, status: { in: ["PENDING", "CONFIRMED"] } },
        select: { startHour: true, hours: true },
      });
      const conflict = existing.some((b) => startHour < b.startHour + b.hours && b.startHour < startHour + hours);
      if (conflict) throw new ApiError("این بازه زمانی تازه رزرو شده؛ لطفاً ساعت دیگری انتخاب کن", 409);

      let total = station.hourlyRate * hours;
      let appliedDiscount: string | null = null;

      if (discountCode) {
        const code = discountCode.toUpperCase();
        const dc = await tx.discount.findUnique({ where: { code } });
        if (dc && dc.active && (!dc.expiresAt || dc.expiresAt > new Date())) {
          // Atomic guarded increment: only succeeds if usage budget remains (prevents oversell race).
          const upd = await tx.discount.updateMany({
            where: { id: dc.id, used: { lt: dc.maxUse } },
            data: { used: { increment: 1 } },
          });
          if (upd.count === 1) {
            total = Math.round(total * (1 - dc.percent / 100));
            appliedDiscount = code;
          }
        }
      }

      if (payMethod === "wallet") {
        if (!session) throw new ApiError("برای پرداخت با کیف پول باید وارد شوی", 401);
        // Atomic guarded decrement: only succeeds if balance is sufficient (prevents double-spend).
        const paid = await tx.user.updateMany({
          where: { id: session.user.id, balance: { gte: total } },
          data: { balance: { decrement: total }, xp: { increment: 50 * hours } },
        });
        if (paid.count === 0) throw new ApiError("موجودی کیف پول کافی نیست", 400);
        await tx.walletTx.create({ data: { userId: session.user.id, amount: -total, type: "PAY", desc: `رزرو ${station.name}` } });
      }

      const created = await tx.booking.create({
        data: {
          userId: session?.user.id ?? null,
          guestName: session ? null : guestName,
          guestPhone: session ? null : guestPhone,
          stationId,
          date,
          startHour,
          hours,
          totalPrice: total,
          payMethod,
          discountCode: appliedDiscount,
          status: payMethod === "online" ? "PENDING" : "CONFIRMED",
        },
      });

      if (session && payMethod !== "wallet") {
        await tx.user.update({ where: { id: session.user.id }, data: { xp: { increment: 50 * hours } } });
      }
      if (session) {
        await tx.notification.create({
          data: {
            userId: session.user.id, title: payMethod === "online" ? "رزرو ثبت شد؛ در انتظار پرداخت ⏳" : "رزرو ثبت شد 🎮",
            body: payMethod === "online"
              ? `رزرو ${station.name} برای ${date} ساعت ${startHour}:۰۰ ثبت شد. برای قطعی‌شدن، پرداخت آنلاین را تکمیل کن.`
              : `رزرو ${station.name} برای ${date} ساعت ${startHour}:۰۰ ثبت شد. کد رهگیری: ${created.id.slice(-8).toUpperCase()}`,
          },
        });
      }
      return created;
    });

    return NextResponse.json({
      ok: true,
      bookingId: booking.id.slice(-8).toUpperCase(),
      total: booking.totalPrice,
      status: booking.status,
      payUrl: booking.status === "PENDING" ? `/pay/${booking.id}` : undefined,
    });
  } catch (e) {
    return apiError(e);
  }
}
