import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { bad, apiError, safeJson, firstIssue } from "@/lib/api-helpers";
import { resetSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(clientKey(req, "reset"), 5, 300_000)) return bad("تلاش بیش از حد", 429);
  try {
    const body = await safeJson<unknown>(req);
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { token, password } = parsed.data;

    const user = await db.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) return bad("لینک بازیابی نامعتبر یا منقضی است", 400);

    await db.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(password, 10), resetToken: null, resetTokenExpiry: null },
    });
    await db.notification.create({ data: { userId: user.id, title: "رمز عبور تغییر کرد 🔐", body: "رمز عبور حساب شما با موفقیت بازیابی شد. اگر این کار را انجام نداده‌اید فوراً با پشتیبانی تماس بگیرید." } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
