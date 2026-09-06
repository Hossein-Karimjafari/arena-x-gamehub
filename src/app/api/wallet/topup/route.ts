import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bad, apiError, safeJson, firstIssue } from "@/lib/api-helpers";
import { topupSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { ZARINPAL_MERCHANT } from "@/lib/env";

const CALLBACK = "/api/wallet/verify";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return bad("ابتدا وارد شو", 401);
  if (!rateLimit(clientKey(req, "topup"), 6, 60_000)) return bad("تلاش بیش از حد؛ کمی صبر کن", 429);
  try {
    const body = await safeJson<unknown>(req);
    const parsed = topupSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { amount } = parsed.data;

    const desc = `شارژ کیف پول ${amount.toLocaleString("fa-IR")} تومانی`;
    let authority: string;
    let payUrl: string;

    if (ZARINPAL_MERCHANT) {
      // Real (or sandbox-merchant) Zarinpal flow
      const res = await fetch("https://payment.zarinpal.com/pg/v4/payment/request.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: ZARINPAL_MERCHANT,
          amount: amount, // Rial vs Toman depends on merchant panel; Zarinpal PG expects Rial
          callback_url: new URL(CALLBACK, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").toString(),
          description: desc,
        }),
      });
      const j = (await res.json()) as { data?: { authority?: string; code?: number }, errors?: unknown };
      const auth = j.data?.authority;
      if (!auth) return bad("خطا در اتصال به درگاه پرداخت", 502);
      authority = auth;
      payUrl = `https://payment.zarinpal.com/pg/StartPay/${auth}`;
    } else {
      // No merchant configured → simulation flow so the app remains fully usable in dev.
      authority = "SIM-" + randomBytes(12).toString("hex");
      payUrl = `/pay/simulate?authority=${authority}&amount=${amount}`;
    }

    await db.payment.create({
      data: { userId: session.user.id, amount, desc, status: "PENDING", authority, gateway: ZARINPAL_MERCHANT ? "zarinpal" : "simulation" },
    });

    return NextResponse.json({ ok: true, payUrl });
  } catch (e) {
    return apiError(e);
  }
}
