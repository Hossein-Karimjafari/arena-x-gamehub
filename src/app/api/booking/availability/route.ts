import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dateRe } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const stationId = req.nextUrl.searchParams.get("stationId");
  const date = req.nextUrl.searchParams.get("date");
  if (!stationId || !date || !dateRe.test(date)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const bookings = await db.booking.findMany({
    where: { stationId, date, status: { in: ["PENDING", "CONFIRMED"] } },
    select: { startHour: true, hours: true },
  });

  // Privacy: only expose whether a slot is taken, never who booked it.
  const taken: Record<number, boolean> = {};
  for (const b of bookings) {
    for (let h = b.startHour; h < b.startHour + b.hours; h++) taken[h] = true;
  }
  return NextResponse.json({ taken });
}
