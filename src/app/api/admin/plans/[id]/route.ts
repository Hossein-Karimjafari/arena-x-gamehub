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
  if ("popular" in data) data.popular = Boolean(data.popular);
  if ("active" in data) data.active = Boolean(data.active);
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    const patch = (await req.json()) as Record<string, unknown>;
    await db.plan.update({ where: { id }, data: pickPatch(patch) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    await db.plan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
