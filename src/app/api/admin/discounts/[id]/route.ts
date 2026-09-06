import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/guard";
import { bad, apiError } from "@/lib/api-helpers";

const DISCOUNT_FIELDS = ["percent", "amount", "maxUse", "active", "expiresAt"] as const;

function pickPatch(patch: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const k of DISCOUNT_FIELDS) if (k in patch) data[k] = patch[k];
  if ("percent" in data) data.percent = Math.min(90, Math.max(1, Math.floor(Number(data.percent) || 1)));
  if ("maxUse" in data) data.maxUse = Math.max(1, Math.floor(Number(data.maxUse) || 1));
  if ("active" in data) data.active = Boolean(data.active);
  if ("expiresAt" in data) data.expiresAt = data.expiresAt ? new Date(String(data.expiresAt)) : null;
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    const patch = (await req.json()) as Record<string, unknown>;
    await db.discount.update({ where: { id }, data: pickPatch(patch) });
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
    await db.discount.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
