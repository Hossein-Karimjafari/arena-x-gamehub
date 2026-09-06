import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bad, apiError, ApiError } from "@/lib/api-helpers";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { ZARINPAL_MERCHANT, SITE_URL } from "@/lib/env";

/**
 * POST /api/booking/[id]/pay — start online payment for a PENDING booking.
 * Creates a Payment row and returns a gateway (or simulation) URL.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return bad("ابتدا وارد شو", 401);
  if (!rateLimit(clientKey(req, "pay"), 6, 60_000)) return bad("تلاش بیش از حد", 429);
  const { id } = await params;

  try {
    const booking = await db.booking.findUnique({ where: { id }, include: { station: true } });
    if (!booking || booking.userId !== session.user.id) throw new ApiError("رزرو یافت نشد", 404);
    if (booking.status !== "PENDING") throw new ApiError("این رزرو نیازی به پرداخت ندارد", 400);

    const desc = `پرداخت رزرو ${booking.station.name} — ${booking.date} ساعت ${booking.startHour}:۰۰`;
    let authority: string;
    let payUrl: string;

    if (ZARINPAL_MERCHANT) {
      const res = await fetch("https://payment.zarinpal.com/pg/v4/payment/request.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: ZARINPAL_MERCHANT,
          amount: booking.totalPrice,
          callback_url: new URL("/api/wallet/verify", SITE_URL).toString(),
          description: desc,
        }),
      });
      const j = (await res.json()) as { data?: { authority?: string } };
      const auth = j.data?.authority;
      if (!auth) return bad("خطا در اتصال به درگاه پرداخت", 502);
      authority = auth;
      payUrl = `https://payment.zarinpal.com/pg/StartPay/${auth}`;
    } else {
      authority = "SIM-" + randomBytes(12).toString("hex");
      payUrl = `/pay/simulate?authority=${authority}&amount=${booking.totalPrice}`;
    }

    await db.payment.create({
      data: { userId: session.user.id, bookingId: booking.id, amount: booking.totalPrice, desc, status: "PENDING", authority, gateway: ZARINPAL_MERCHANT ? "zarinpal" : "simulation" },
    });

    return NextResponse.json({ ok: true, payUrl });
  } catch (e) {
    return apiError(e);
  }
}
