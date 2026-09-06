import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bad, apiError } from "@/lib/api-helpers";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Zarinpal callback: GET /api/wallet/verify?Authority=...&Status=OK|NOK
 * Credits the wallet exactly once for a PENDING payment, then redirects to the wallet page.
 */
export async function GET(req: NextRequest) {
  try {
    if (!rateLimit(clientKey(req, "verify"), 20, 60_000)) return bad("تلاش بیش از حد", 429);
    const authority = req.nextUrl.searchParams.get("Authority");
    const status = req.nextUrl.searchParams.get("Status");
    const base = new URL("/dashboard/wallet", process.env.NEXT_PUBLIC_SITE_URL ?? req.url);

    if (!authority) return NextResponse.redirect(new URL("?pay=invalid", base));

    const payment = await db.payment.findUnique({ where: { authority } });
    if (!payment) return NextResponse.redirect(new URL("?pay=notfound", base));
    if (payment.status === "SUCCESS") return NextResponse.redirect(new URL("?pay=already", base));
    if (status !== "OK") {
      await db.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      return NextResponse.redirect(new URL("?pay=failed", base));
    }

    const merchant = process.env.ZARINPAL_MERCHANT_ID ?? "";
    const ok = await (async () => {
      if (!merchant) return true; // simulation gateway: authority issued locally
      const res = await fetch("https://payment.zarinpal.com/pg/v4/payment/verify.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id: merchant, amount: payment.amount, authority }),
      });
      const j = (await res.json()) as { data?: { code?: number } };
      return j.data?.code === 100 || j.data?.code === 101;
    })();

    if (!ok) {
      await db.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      return NextResponse.redirect(new URL("?pay=failed", base));
    }

    const userId = payment.userId;
    if (!userId) return NextResponse.redirect(new URL("?pay=notfound", base));

    if (payment.bookingId) {
      // Payment for a pending booking: confirm the booking.
      await db.$transaction([
        db.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS", refId: "ZP-" + authority.slice(-8) } }),
        db.booking.update({ where: { id: payment.bookingId }, data: { status: "CONFIRMED" } }),
        db.notification.create({
          data: { userId, title: "پرداخت تایید شد ✅", body: "پرداخت رزرو انجام و رزرو شما قطعی شد. کد رهگیری در داشبورد قابل مشاهده است." },
        }),
      ]);
    } else {
      await db.$transaction([
        db.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS", refId: "ZP-" + authority.slice(-8) } }),
        db.user.update({ where: { id: userId }, data: { balance: { increment: payment.amount }, xp: { increment: Math.floor(payment.amount / 10000) } } }),
        db.walletTx.create({ data: { userId, amount: payment.amount, type: "TOPUP", desc: "شارژ آنلاین کیف پول" } }),
        db.notification.create({ data: { userId, title: "کیف پول شارژ شد 👛", body: `مبلغ ${payment.amount.toLocaleString("fa-IR")} تومان با موفقیت به کیف پول شما اضافه شد.` } }),
      ]);
    }

    return NextResponse.redirect(new URL("?pay=success", base));
  } catch (e) {
    return apiError(e);
  }
}
