import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bad, apiError, safeJson } from "@/lib/api-helpers";

/** PATCH: mark one or all notifications as read for the signed-in user. */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return bad("ابتدا وارد شو", 401);
  try {
    const body = await safeJson<{ id?: string }>(req);
    if (body?.id) {
      await db.notification.updateMany({ where: { id: body.id, userId: session.user.id }, data: { read: true } });
    } else {
      await db.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
