import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/guard";
import { bad, apiError } from "@/lib/api-helpers";

const GAME_FIELDS = ["title", "titleEn", "slug", "genre", "platform", "emoji", "gradient", "description", "sysreq", "multiplayer", "players", "popular", "active", "pricePerHour"] as const;

function pickPatch(patch: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const k of GAME_FIELDS) if (k in patch) data[k] = patch[k];
  if (typeof data.slug === "string") data.slug = data.slug.trim().toLowerCase();
  if ("pricePerHour" in data) data.pricePerHour = Math.max(0, Math.floor(Number(data.pricePerHour) || 0));
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    const patch = (await req.json()) as Record<string, unknown>;
    const game = await db.game.update({ where: { id }, data: pickPatch(patch) });
    return NextResponse.json(game);
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return bad("فقط مدیر کل مجاز است", 403);
  try {
    const { id } = await params;
    await db.review.deleteMany({ where: { gameId: id } });
    await db.game.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
