import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { bad, apiError, safeJson, firstIssue } from "@/lib/api-helpers";
import { forgotSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/env";

/**
 * Issues a password-reset token. In production, send it via email/SMS provider
 * (Kavenegar etc.); here it is delivered via in-app notification + logged link
 * so the flow works end-to-end without external services.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(clientKey(req, "forgot"), 3, 300_000)) return bad("تلاش بیش از حد؛ کمی صبر کن", 429);
  try {
    const body = await safeJson<unknown>(req);
    const parsed = forgotSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { email } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    // Always respond ok — never leak which emails exist.
    if (!user) return NextResponse.json({ ok: true });

    const token = randomBytes(24).toString("hex");
    await db.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 30 * 60_000) }, // 30 min
    });

    const link = `${SITE_URL}/reset-password?token=${token}`;
    await db.notification.create({
      data: {
        userId: user.id,
        title: "بازیابی رمز عبور 🔑",
        body: `برای تغییر رمز، تا ۳۰ دقیقه آینده روی این لینک بروید: ${link}`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
