import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { bad, apiError, safeJson, firstIssue } from "@/lib/api-helpers";
import { passwordChangeSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return bad("ابتدا وارد شو", 401);
  if (!rateLimit(clientKey(req, "passwd"), 5, 60_000)) return bad("تلاش بیش از حد؛ کمی صبر کن", 429);
  try {
    const body = await safeJson<unknown>(req);
    const parsed = passwordChangeSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { current, next } = parsed.data;

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return bad("کاربر یافت نشد", 404);
    if (!(await bcrypt.compare(current, user.password))) return bad("رمز فعلی اشتباه است", 401);

    await db.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(next, 10) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
