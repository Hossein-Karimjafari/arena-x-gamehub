import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/guard";
import { bad, apiError } from "@/lib/api-helpers";
import { stationTypeEnum } from "@/lib/validation";

export async function GET() {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  const stations = await db.station.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] });
  return NextResponse.json({ stations });
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const fd = await req.formData();
    const name = fd.get("name")?.toString().trim();
    const type = fd.get("type")?.toString();
    const specs = fd.get("specs")?.toString().trim();
    const hourlyRate = Math.max(0, Math.floor(Number(fd.get("hourlyRate")) || 0));
    const parsedType = stationTypeEnum.safeParse(type);
    if (!name || !parsedType.success || !specs) return bad("نام، نوع و مشخصات الزامی است");

    await db.station.create({ data: { name, type: parsedType.data, specs, hourlyRate } });
    return NextResponse.redirect(new URL("/admin/stations", req.url), { status: 303 });
  } catch (e) {
    return apiError(e);
  }
}
