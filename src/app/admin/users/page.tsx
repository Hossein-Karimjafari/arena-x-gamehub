import Link from "next/link";
import { db } from "@/lib/db";
import { dateFa, toman, faNum } from "@/lib/constants";
import UserRow from "./UserRow";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page, q } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const query = (q ?? "").trim();
  const where = query
    ? { OR: [{ name: { contains: query } }, { username: { contains: query.toLowerCase() } }, { email: { contains: query.toLowerCase() } }, { phone: { contains: query } }] }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.user.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <form className="glass flex gap-2 p-4" action="/admin/users">
        <input name="q" defaultValue={query} placeholder="جستجوی نام / یوزرنیم / ایمیل / موبایل…" className="input !py-2 !text-sm" />
        <button className="btn-outline shrink-0 !px-5 !py-2 !text-sm">جستجو</button>
      </form>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-white/5"><tr>
            <th className="table-th">نام</th><th className="table-th">تماس</th><th className="table-th">نقش</th>
            <th className="table-th">موجودی</th><th className="table-th">XP / سطح</th><th className="table-th">عضویت</th><th className="table-th">عملیات</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="table-td"><b>{u.name ?? "—"}</b><br /><span className="text-[10px] text-slate-500">@{u.username}</span></td>
                <td className="table-td text-xs" dir="ltr">{u.phone ?? u.email ?? "—"}</td>
                <td className="table-td"><span className={`chip !py-0.5 !text-[10px] ${u.role === "ADMIN" ? "!text-neon-pink !border-neon-pink/40" : u.role === "OPERATOR" ? "!text-neon-cyan !border-neon-cyan/40" : ""}`}>{u.role}</span></td>
                <td className="table-td">{toman(u.balance)}</td>
                <td className="table-td">{faNum(u.xp)} / {u.level}</td>
                <td className="table-td text-xs">{dateFa(u.createdAt)}</td>
                <td className="table-td"><UserRow id={u.id} role={u.role} balance={u.balance} /></td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={7} className="table-td text-center text-slate-500">کاربری یافت نشد.</td></tr>}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={`/admin/users?page=${n}${query ? `&q=${encodeURIComponent(query)}` : ""}`} className={`chip !px-3 !py-1 !text-xs ${n === p ? "!border-neon-purple !text-white" : ""}`}>{faNum(n)}</Link>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-500">کل: {faNum(total)} کاربر • صفحه {faNum(p)} از {faNum(pages)}</p>
    </div>
  );
}
