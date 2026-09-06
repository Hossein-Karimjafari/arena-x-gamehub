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
  if ("multiplayer" in data) data.multiplayer = Boolean(data.multiplayer);
  if ("popular" in data) data.popular = Boolean(data.popular);
  if ("active" in data) data.active = Boolean(data.active);
  return data;
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const fd = await req.formData();
    const g = (k: string) => (fd.get(k)?.toString() ?? "").trim();

    await db.game.create({
      data: {
        title: g("title"), titleEn: g("titleEn"), slug: g("slug").toLowerCase(), genre: g("genre"),
        platform: g("platform") || "PC", emoji: g("emoji") || "🎮", description: g("description") || "به‌زودی...",
        pricePerHour: Math.max(0, Number(g("pricePerHour")) || 150000), sysreq: g("sysreq") || null,
      },
    });
    return NextResponse.redirect(new URL("/admin/games", req.url), { status: 303 });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id, ...patch } = (await req.json()) as { id?: string } & Record<string, unknown>;
    if (!id) return bad("id لازم است");
    const game = await db.game.update({ where: { id }, data: pickPatch(patch) });
    return NextResponse.json(game);
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return bad("فقط مدیر کل مجاز است", 403);
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return bad("id لازم است");
    await db.review.deleteMany({ where: { gameId: id } });
    await db.game.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
