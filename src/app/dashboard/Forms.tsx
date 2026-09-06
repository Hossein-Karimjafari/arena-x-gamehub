"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ProfileForm({ user }: { user: { name: string; phone: string; email: string } }) {
  const router = useRouter();
  const [form, setForm] = useState(user);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "✅ ذخیره شد" });
      router.refresh();
    } else setMsg({ ok: false, text: "❌ " + (j.error ?? "خطا") });
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-sm">
      <div><label className="label">نام</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" maxLength={60} /></div>
      <div><label className="label">موبایل</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" dir="ltr" maxLength={11} placeholder="09xxxxxxxxx" /></div>
      <div><label className="label">ایمیل</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" dir="ltr" type="email" /></div>
      {msg && <p className={`text-xs ${msg.ok ? "text-neon-green" : "text-neon-red"}`}>{msg.text}</p>}
      <button disabled={busy} className="btn-outline w-full !py-2.5 !text-sm disabled:opacity-50">{busy ? "در حال ذخیره…" : "ذخیره تغییرات"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    const j = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "✅ رمز تغییر کرد" });
      setCurrent("");
      setNext("");
    } else setMsg({ ok: false, text: "❌ " + (j.error ?? "خطا") });
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-sm">
      <div><label className="label">رمز فعلی</label><input value={current} onChange={(e) => setCurrent(e.target.value)} type="password" required className="input" dir="ltr" /></div>
      <div><label className="label">رمز جدید</label><input value={next} onChange={(e) => setNext(e.target.value)} type="password" required minLength={6} className="input" dir="ltr" /></div>
      {msg && <p className={`text-xs ${msg.ok ? "text-neon-green" : "text-neon-red"}`}>{msg.text}</p>}
      <button disabled={busy} className="btn-outline w-full !py-2.5 !text-sm disabled:opacity-50">{busy ? "در حال تغییر…" : "تغییر رمز"}</button>
    </form>
  );
}

export function ReferralCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button type="button" onClick={copy} title="کپی کد دعوت" className="font-mono text-lg font-black text-neon-cyan underline decoration-dotted underline-offset-4" dir="ltr">
      {copied ? "کپی شد ✓" : code}
    </button>
  );
}

export function CancelBooking({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function cancel() {
    if (!confirm("این رزرو لغو شود؟ مبلغ پرداختی به کیف پول بازمی‌گردد.")) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/booking/${id}/cancel`, { method: "POST" });
    const j = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg(j.refunded ? `✅ لغو شد؛ ${new Intl.NumberFormat("fa-IR").format(j.amount)} تومان به کیف پول بازگشت` : "✅ رزرو لغو شد");
      router.refresh();
    } else setMsg("❌ " + (j.error ?? "خطا"));
  }

  return (
    <div className="text-left">
      <button disabled={busy} onClick={cancel} className="rounded-lg border border-neon-red/40 px-3 py-1.5 text-[11px] text-neon-red hover:bg-neon-red/10 disabled:opacity-40">لغو رزرو</button>
      {msg && <p className="mt-1 max-w-48 text-[10px] leading-4 text-slate-300">{msg}</p>}
    </div>
  );
}

export function PayPending({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    const res = await fetch(`/api/booking/${id}/pay`, { method: "POST" });
    const j = await res.json();
    setBusy(false);
    if (res.ok && j.payUrl) window.location.href = j.payUrl;
  }

  return (
    <button disabled={busy} onClick={pay} className="rounded-lg border border-neon-cyan/40 px-3 py-1.5 text-[11px] text-neon-cyan hover:bg-neon-cyan/10 disabled:opacity-40">
      {busy ? "…" : "🏦 پرداخت آنلاین"}
    </button>
  );
}

export function FeedbackFromQuery() {
  const sp = useSearchParams();
  const pay = sp.get("pay");
  if (!pay) return null;
  const map: Record<string, string> = {
    success: "✅ پرداخت با موفقیت انجام شد",
    failed: "❌ پرداخت ناموفق بود یا لغو شد",
    already: "این پرداخت قبلاً ثبت شده است",
    notfound: "پرداخت یافت نشد",
    invalid: "درخواست پرداخت نامعتبر است",
  };
  const ok = pay === "success" || pay === "already";
  return <p className={`glass mb-6 p-4 text-center text-sm ${ok ? "text-neon-green" : "text-neon-red"}`}>{map[pay] ?? ""}</p>;
}
