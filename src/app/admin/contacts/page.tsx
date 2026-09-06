import { db } from "@/lib/db";
import { dateFa } from "@/lib/constants";
import ContactRow from "./ContactRow";

export const dynamic = "force-dynamic";

export default async function AdminContacts() {
  const contacts = await db.contact.findMany({ orderBy: [{ answered: "asc" }, { createdAt: "desc" }], take: 100 });

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-white">📩 پیام‌های فرم تماس</h3>
      <div className="space-y-3">
        {contacts.map((c) => (
          <div key={c.id} className={`glass p-4 ${c.answered ? "opacity-60" : "border-r-2 border-neon-cyan"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm">
                <b className="text-white">{c.name}</b>
                <span className="text-slate-500"> • {c.subject}</span>
                {c.answered ? <span className="text-neon-green"> • پاسخ داده شد</span> : ""}
              </p>
              <ContactRow id={c.id} answered={c.answered} />
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-300">{c.message}</p>
            <p className="mt-1 text-[10px] text-slate-500" dir="ltr">{c.email} {c.phone ? `• ${c.phone}` : ""} • {dateFa(c.createdAt)}</p>
          </div>
        ))}
        {contacts.length === 0 && <p className="glass p-6 text-sm text-slate-400">پیامی ثبت نشده.</p>}
      </div>
    </div>
  );
}
