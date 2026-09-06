import SendNotification from "./SendNotification";
import { dateFa } from "@/lib/constants";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminNotifications() {
  const [sent, contacts] = await Promise.all([
    db.notification.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.contact.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <div className="space-y-6">
      <SendNotification />

      <div className="glass overflow-x-auto">
        <h3 className="border-b border-white/5 p-4 font-bold text-white">🔔 اعلان‌های ارسال‌شده</h3>
        <table className="w-full min-w-[620px]">
          <thead className="bg-white/5"><tr><th className="table-th">گیرنده</th><th className="table-th">عنوان</th><th className="table-th">متن</th><th className="table-th">زمان</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {sent.map((n) => (
              <tr key={n.id}>
                <td className="table-td">{n.user?.name ?? "همه"}</td>
                <td className="table-td"><b>{n.title}</b></td>
                <td className="table-td max-w-xs truncate text-xs text-slate-400">{n.body}</td>
                <td className="table-td text-xs">{dateFa(n.createdAt, { year: "2-digit", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass overflow-x-auto">
        <h3 className="border-b border-white/5 p-4 font-bold text-white">📩 پیام‌های فرم تماس</h3>
        <table className="w-full min-w-[620px]">
          <thead className="bg-white/5"><tr><th className="table-th">فرستنده</th><th className="table-th">موضوع</th><th className="table-th">پیام</th><th className="table-th">زمان</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {contacts.map((c) => (
              <tr key={c.id}>
                <td className="table-td text-xs">{c.name}<br /><span className="text-slate-500" dir="ltr">{c.email}</span></td>
                <td className="table-td"><b>{c.subject}</b></td>
                <td className="table-td max-w-xs truncate text-xs text-slate-400">{c.message}</td>
                <td className="table-td text-xs">{dateFa(c.createdAt, { year: "2-digit", month: "short", day: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
