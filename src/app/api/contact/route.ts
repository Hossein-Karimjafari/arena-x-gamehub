import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bad, apiError, safeJson, firstIssue } from "@/lib/api-helpers";
import { contactSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(clientKey(req, "contact"), 3, 300_000)) return bad("تلاش بیش از حد؛ کمی صبر کن", 429);
  try {
    const body = await safeJson<unknown>(req);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { name, email, phone, subject, message } = parsed.data;

    await db.contact.create({ data: { name, email, phone: phone ?? "", subject, message } });
    const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length > 0) {
      await db.notification.createMany({ data: admins.map((a) => ({ userId: a.id, title: "پیام جدید از فرم تماس 📩", body: `${name}: ${subject}` })) });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
