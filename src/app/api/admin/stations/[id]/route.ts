import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/guard";
import { bad, apiError, safeJson } from "@/lib/api-helpers";
import { stationTypeEnum } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    const patch = (await safeJson<Record<string, unknown>>(req)) ?? {};
    const data: Record<string, unknown> = {};
    if ("name" in patch) data.name = String(patch.name).trim();
    if ("specs" in patch) data.specs = String(patch.specs).trim();
    if ("hourlyRate" in patch) data.hourlyRate = Math.max(0, Math.floor(Number(patch.hourlyRate) || 0));
    if ("active" in patch) data.active = Boolean(patch.active);
    if ("online" in patch) data.online = Boolean(patch.online);
    if ("type" in patch) {
      const t = stationTypeEnum.safeParse(patch.type);
      if (!t.success) return bad("نوع دستگاه نامعتبر است");
      data.type = t.data;
    }
    await db.station.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return bad("فقط مدیر کل مجاز است", 403);
  try {
    const { id } = await params;
    const count = await db.booking.count({ where: { stationId: id } });
    if (count > 0) return bad("این دستگاه رزرو ثبت‌شده دارد؛ ابتدا رزروها را مدیریت کنید", 409);
    await db.station.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
