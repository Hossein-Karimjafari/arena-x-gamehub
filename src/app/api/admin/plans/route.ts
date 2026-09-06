import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { bad, apiError } from "@/lib/api-helpers";

const PLAN_FIELDS = ["title", "price", "hours", "features", "badge", "popular", "order", "active"] as const;

function pickPatch(patch: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const k of PLAN_FIELDS) if (k in patch) data[k] = patch[k];
  if ("price" in data) data.price = Math.max(0, Math.floor(Number(data.price) || 0));
  if ("hours" in data) data.hours = Math.max(0, Math.floor(Number(data.hours) || 0));
  if ("order" in data) data.order = Math.max(0, Math.floor(Number(data.order) || 9));
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
    const features = g("features").split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 10);

    await db.plan.create({
      data: {
        title: g("title"), price: Math.max(0, Number(g("price")) || 0), hours: Math.max(0, Number(g("hours")) || 0),
        features: JSON.stringify(features), order: Math.max(0, Number(g("order")) || 9), period: "CUSTOM",
      },
    });
    return NextResponse.redirect(new URL("/admin/plans", req.url), { status: 303 });
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
    await db.plan.update({ where: { id }, data: pickPatch(patch) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return bad("id لازم است");
    await db.plan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
