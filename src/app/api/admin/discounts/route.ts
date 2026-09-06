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
  if ("amount" in data) data.amount = data.amount == null ? null : Math.max(0, Math.floor(Number(data.amount) || 0));
  if ("active" in data) data.active = Boolean(data.active);
  if ("expiresAt" in data) data.expiresAt = data.expiresAt ? new Date(String(data.expiresAt)) : null;
  return data;
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const fd = await req.formData();
    const code = fd.get("code")?.toString().trim().toUpperCase();
    if (!code) return bad("کد تخفیف الزامی است", 400);
    const expires = fd.get("expiresAt")?.toString();

    await db.discount.create({
      data: {
        code,
        percent: Math.min(90, Math.max(1, Number(fd.get("percent")) || 10)),
        maxUse: Math.max(1, Number(fd.get("maxUse")) || 100),
        expiresAt: expires ? new Date(expires) : null,
      },
    });
    return NextResponse.redirect(new URL("/admin/discounts", req.url), { status: 303 });
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
    await db.discount.update({ where: { id }, data: pickPatch(patch) });
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
    await db.discount.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
