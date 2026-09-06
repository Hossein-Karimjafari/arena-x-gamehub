"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setOk(true);
      setMsg("✅ پیامت رسید! خیلی زود جواب می‌دیم.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } else { setOk(false); setMsg("❌ " + (j.error ?? "خطایی رخ داد؛ دوباره تلاش کن.")); }
  }

  return (
    <form onSubmit={submit} className="glass space-y-4 p-6">
      <h3 className="font-black text-white">✉️ فرم تماس</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">نام *</label><input value={form.name} onChange={set("name")} required className="input" /></div>
        <div><label className="label">موبایل</label><input value={form.phone} onChange={set("phone")} className="input" dir="ltr" /></div>
        <div className="sm:col-span-2"><label className="label">ایمیل *</label><input type="email" value={form.email} onChange={set("email")} required className="input" dir="ltr" /></div>
        <div className="sm:col-span-2"><label className="label">موضوع *</label><input value={form.subject} onChange={set("subject")} required className="input" placeholder="مثلاً رزرو ایونت خصوصی" /></div>
        <div className="sm:col-span-2"><label className="label">پیام *</label><textarea value={form.message} onChange={set("message")} required minLength={10} maxLength={2000} className="input min-h-28" /></div>
      </div>
      {msg && <p className={`text-sm ${ok ? "text-neon-green" : "text-neon-red"}`}>{msg}</p>}
      <button disabled={busy} className="btn-neon w-full !py-3">{busy ? "در حال ارسال..." : "ارسال پیام"}</button>
    </form>
  );
}
