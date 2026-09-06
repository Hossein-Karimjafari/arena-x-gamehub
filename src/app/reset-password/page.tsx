"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function ResetInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const j = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg("✅ رمز تغییر کرد؛ حالا وارد شو");
      setTimeout(() => router.push("/login"), 1500);
    } else setMsg("❌ " + (j.error ?? "خطا"));
  }

  return (
    <div className="glass p-8">
      <h1 className="mb-1 text-center font-display text-2xl font-black text-white">بازیابی رمز عبور</h1>
      <p className="mb-8 text-center text-sm text-slate-400">رمز جدید خود را وارد کن</p>
      {!token ? (
        <p className="text-center text-sm text-neon-red">لینک نامعتبر است. <Link href="/forgot-password" className="underline">درخواست لینک جدید</Link></p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">رمز عبور جدید</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input" dir="ltr" placeholder="••••••••" />
          </div>
          {msg && <p className="text-center text-xs text-slate-200">{msg}</p>}
          <button disabled={busy} className="btn-neon w-full !py-3">{busy ? "در حال ثبت…" : "ثبت رمز جدید"}</button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20">
      <Suspense fallback={<p className="text-center text-slate-400">در حال بارگذاری…</p>}>
        <ResetInner />
      </Suspense>
    </div>
  );
}
