import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/guard";
import { bad, apiError } from "@/lib/api-helpers";
import { slugRe } from "@/lib/validation";

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

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const fd = await req.formData();
    const g = (k: string) => (fd.get(k)?.toString() ?? "").trim();
    const slug = g("slug").toLowerCase();
    const dateStr = g("date");
    if (!slug || !slugRe.test(slug)) return bad("اسلاگ نامعتبر است (حروف انگلیسی کوچک و خط تیره)");
    if (!dateStr || Number.isNaN(new Date(dateStr).getTime())) return bad("تاریخ مسابقه نامعتبر است");

    await db.tournament.create({
      data: {
        title: g("title"), slug, game: g("game"), platform: g("platform") || "PC",
        date: new Date(dateStr), prize: g("prize") || "جوایز نقدی", entryFee: Math.max(0, Number(g("entryFee")) || 0),
        capacity: Math.max(2, Number(g("capacity")) || 32), teamSize: Math.max(1, Number(g("teamSize")) || 1),
        description: g("description") || "", rules: g("rules") || "",
      },
    });
    return NextResponse.redirect(new URL("/admin/tournaments", req.url), { status: 303 });
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
    await db.tournament.update({ where: { id }, data: pickPatch(patch) });
    return NextResponse.json({ ok: true });
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
    await db.tournamentRegistration.deleteMany({ where: { tournamentId: id } });
    await db.tournament.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
