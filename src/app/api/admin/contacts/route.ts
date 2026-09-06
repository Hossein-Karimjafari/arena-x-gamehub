import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { bad, apiError, safeJson } from "@/lib/api-helpers";

/** GET: list contact messages (staff) */
export async function GET(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  const answered = req.nextUrl.searchParams.get("answered");
  const contacts = await db.contact.findMany({
    where: answered === null ? {} : { answered: answered === "true" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ contacts });
}

/** PATCH: toggle answered ({ id, answered }) */
export async function PATCH(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const body = await safeJson<{ id?: string; answered?: boolean }>(req);
    if (!body?.id || typeof body.answered !== "boolean") return bad("id و answered الزامی است");
    await db.contact.update({ where: { id: body.id }, data: { answered: body.answered } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
