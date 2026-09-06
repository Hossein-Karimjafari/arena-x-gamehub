import { db } from "@/lib/db";
import BookingClient from "./BookingClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "رزرو آنلاین" };

export default async function BookingPage() {
  const [stations, games] = await Promise.all([
    db.station.findMany({ where: { active: true }, orderBy: [{ type: "asc" }, { name: "asc" }], select: { id: true, name: true, type: true, specs: true, hourlyRate: true, online: true, active: true } }),
    db.game.findMany({ where: { active: true }, orderBy: { title: "asc" }, select: { slug: true, title: true, platform: true } }),
  ]);
  return <BookingClient stations={stations} games={games} />;
}
