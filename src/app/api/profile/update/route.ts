import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bad, apiError, safeJson, firstIssue } from "@/lib/api-helpers";
import { profileUpdateSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return bad("ابتدا وارد شو", 401);
  if (!rateLimit(clientKey(req, "profile"), 10, 60_000)) return bad("تلاش بیش از حد", 429);
  try {
    const body = await safeJson<unknown>(req);
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { name, phone, email } = parsed.data;

    const data: { name?: string; phone?: string | null; email?: string | null } = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone || null;
    if (email !== undefined) data.email = email || null;

    const user = await db.user.update({ where: { id: session.user.id }, data, select: { name: true, phone: true, email: true } });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return apiError(e); // P2002 handled centrally → 409 duplicate email/phone
  }
}
