"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendNotification() {
  const [form, setForm] = useState({ userId: "", title: "", body: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) {
      const j = await res.json();
      setMsg(`✅ به ${j.count} کاربر ارسال شد`);
      setForm({ userId: "", title: "", body: "" });
      router.refresh();
    } else setMsg("❌ خطا");
  }

  return (
    <form onSubmit={submit} className="glass grid gap-4 p-6 sm:grid-cols-4">
      <div className="sm:col-span-4"><h3 className="font-bold text-white">📢 ارسال اطلاع‌رسانی</h3></div>
      <div className="sm:col-span-2"><label className="label">عنوان</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input" /></div>
      <div className="sm:col-span-2"><label className="label">شناسه کاربر (خالی = همه)</label><input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} dir="ltr" className="input !font-mono !text-xs" placeholder="کوچک اما اختیاری" /></div>
      <div className="sm:col-span-4"><label className="label">متن پیام</label><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required className="input min-h-20" /></div>
      <button disabled={busy} className="btn-neon sm:col-span-4 !py-3">{busy ? "..." : "ارسال"}</button>
      {msg && <p className="sm:col-span-4 text-sm text-neon-green">{msg}</p>}
    </form>
  );
}
