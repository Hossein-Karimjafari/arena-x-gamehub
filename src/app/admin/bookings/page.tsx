import Link from "next/link";
import { db } from "@/lib/db";
import { toman, dateFa, faNum, STATUS_FA } from "@/lib/constants";
import BookingActions from "./BookingActions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const p = Math.max(1, Number(page) || 1);

  const [bookings, total] = await Promise.all([
    db.booking.findMany({ include: { user: true, station: true }, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.booking.count(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead className="bg-white/5"><tr>
            <th className="table-th">کد</th><th className="table-th">کاربر</th><th className="table-th">دستگاه</th>
            <th className="table-th">تاریخ/ساعت</th><th className="table-th">مدت</th><th className="table-th">مبلغ</th>
            <th className="table-th">پرداخت</th><th className="table-th">وضعیت</th><th className="table-th">عملیات</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="table-td font-mono text-xs">{b.id.slice(-6).toUpperCase()}</td>
                <td className="table-td">{b.user?.name ?? b.guestName ?? "مهمان"}<br /><span className="text-[10px] text-slate-500">{b.user?.phone ?? b.guestPhone ?? ""}</span></td>
                <td className="table-td">{b.station.name}</td>
                <td className="table-td text-xs">{dateFa(b.date)}<br />{faNum(b.startHour)}:۰۰</td>
                <td className="table-td">{faNum(b.hours)} ساعت</td>
                <td className="table-td">{toman(b.totalPrice)}</td>
                <td className="table-td text-xs">{b.payMethod === "wallet" ? "کیف پول" : b.payMethod === "online" ? "آنلاین" : "در محل"}</td>
                <td className="table-td"><span className="chip !py-0.5 !text-[10px]">{STATUS_FA[b.status]}</span></td>
                <td className="table-td"><BookingActions id={b.id} status={b.status} /></td>
              </tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan={9} className="table-td text-center text-slate-500">رزروی نیست.</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={`/admin/bookings?page=${n}`} className={`chip !px-3 !py-1 !text-xs ${n === p ? "!border-neon-purple !text-white" : ""}`}>{faNum(n)}</Link>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-500">کل: {faNum(total)} رزرو • صفحه {faNum(p)} از {faNum(pages)}</p>
    </div>
  );
}
