import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { bad, firstIssue, apiError, safeJson } from "@/lib/api-helpers";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(clientKey(req, "register"), 5, 60_000)) return bad("تلاش بیش از حد؛ کمی صبر کن", 429);
  try {
    const body = await safeJson<unknown>(req);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { name, username, email, phone, password, referral } = parsed.data;
    const uname = username.toLowerCase();

    const dup = await db.user.findFirst({
      where: { OR: [{ username: uname }, ...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])] },
    });
    if (dup) {
      const field = dup.username === uname ? "نام کاربری" : dup.email === email ? "ایمیل" : "شماره موبایل";
      return bad(`این ${field} قبلاً ثبت شده`, 409);
    }

    const referrer = referral ? await db.user.findUnique({ where: { referralCode: referral } }) : null;
    const bonus = referrer ? 50000 : 20000;

    const user = await db.user.create({
      data: {
        name: name ?? null,
        username: uname,
        email: email || null,
        phone: phone || null,
        password: await bcrypt.hash(password, 10),
        referredById: referrer?.id,
        balance: bonus,
        xp: 50,
        level: 1,
      },
    });

    await db.$transaction([
      db.walletTx.create({ data: { userId: user.id, amount: bonus, type: "BONUS", desc: "هدیه خوش‌آمدگویی آرنا 🎁" } }),
      db.notification.create({
        data: { userId: user.id, title: "به آرنا ایکس خوش آمدی! 🎮", body: "۲۰٬۰۰۰ تومان اعتبار هدیه به کیف پولت اضافه شد. اولین رزروت را ثبت کن!" },
      }),
      ...(referrer
        ? [
            db.user.update({ where: { id: referrer.id }, data: { balance: { increment: 30000 }, xp: { increment: 100 } } }),
            db.walletTx.create({ data: { userId: referrer.id, amount: 30000, type: "BONUS", desc: "پاداش دعوت دوست 🤝" } }),
          ]
        : []),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
