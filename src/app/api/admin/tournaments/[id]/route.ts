import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/guard";
import { bad, apiError } from "@/lib/api-helpers";

const T_FIELDS = ["title", "slug", "game", "platform", "emoji", "date", "prize", "entryFee", "capacity", "teamSize", "rules", "description", "status"] as const;

function pickPatch(patch: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const k of T_FIELDS) if (k in patch) data[k] = patch[k];
  if (typeof data.slug === "string") data.slug = data.slug.trim().toLowerCase();
  if ("entryFee" in data) data.entryFee = Math.max(0, Math.floor(Number(data.entryFee) || 0));
  if ("capacity" in data) data.capacity = Math.max(2, Math.floor(Number(data.capacity) || 32));
  if ("teamSize" in data) data.teamSize = Math.max(1, Math.floor(Number(data.teamSize) || 1));
  if ("date" in data) data.date = new Date(String(data.date));
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    const patch = (await req.json()) as Record<string, unknown>;
    await db.tournament.update({ where: { id }, data: pickPatch(patch) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return bad("فقط مدیر کل مجاز است", 403);
  try {
    const { id } = await params;
    await db.tournamentRegistration.deleteMany({ where: { tournamentId: id } });
    await db.tournament.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
