import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { bad, apiError, safeJson } from "@/lib/api-helpers";
import { bookingStatusEnum } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    const body = await safeJson<{ status?: string }>(req);
    const parsed = bookingStatusEnum.safeParse(body?.status);
    if (!parsed.success) return bad("وضعیت نامعتبر است");

    const booking = await db.$transaction(async (tx) => {
      const b = await tx.booking.findUnique({ where: { id }, include: { user: true, station: true } });
      if (!b) return null;
      // Refund wallet payment exactly once when cancelling a paid booking.
      const shouldRefund = parsed.data === "CANCELLED" && b.status !== "CANCELLED" && (b.payMethod === "wallet" || b.payMethod === "online");
      const updated = await tx.booking.update({ where: { id }, data: { status: parsed.data } });
      if (shouldRefund && b.userId) {
        await tx.user.update({ where: { id: b.userId }, data: { balance: { increment: b.totalPrice } } });
        await tx.walletTx.create({ data: { userId: b.userId, amount: b.totalPrice, type: "REFUND", desc: `بازگشت وجه لغو رزرو ${b.station.name}` } });
      }
      return { updated, b };
    });
    if (!booking) return bad("رزرو یافت نشد", 404);

    const { b } = booking;
    if (b.user) {
      if (parsed.data === "CANCELLED") {
        const refunded = b.payMethod === "wallet" || b.payMethod === "online";
        await db.notification.create({
          data: {
            userId: b.user.id, title: "رزرو شما لغو شد",
            body: refunded
              ? `رزرو ${b.station.name} لغو و مبلغ ${b.totalPrice.toLocaleString("fa-IR")} تومان به کیف پول شما بازگشت داده شد.`
              : `رزرو ${b.station.name} لغو شد.`,
          },
        });
      }
      if (parsed.data === "CONFIRMED") {
        await db.notification.create({
          data: { userId: b.user.id, title: "رزرو تایید شد ✅", body: `رزرو ${b.station.name} برای ${b.date} ساعت ${b.startHour}:۰۰ تایید شد.` },
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
