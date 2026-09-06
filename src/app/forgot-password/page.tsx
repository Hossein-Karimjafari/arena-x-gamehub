"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const j = await res.json();
    setBusy(false);
    setMsg(res.ok ? "✅ اگر این ایمیل ثبت شده باشد، لینک بازیابی برایتان ارسال شد (اعلان داشبورد را هم چک کن)" : "❌ " + (j.error ?? "خطا"));
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20">
      <div className="glass p-8">
        <h1 className="mb-1 text-center font-display text-2xl font-black text-white">فراموشی رمز عبور</h1>
        <p className="mb-8 text-center text-sm text-slate-400">ایمیل حساب خود را وارد کن</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">ایمیل</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="input" dir="ltr" placeholder="you@example.com" />
          </div>
          {msg && <p className="text-center text-xs leading-6 text-slate-200">{msg}</p>}
          <button disabled={busy} className="btn-neon w-full !py-3">{busy ? "در حال ارسال…" : "ارسال لینک بازیابی"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/login" className="font-bold text-neon-purple hover:underline">بازگشت به ورود</Link>
        </p>
      </div>
    </div>
  );
}
