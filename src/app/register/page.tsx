"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "", referral: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) return setError(j.error ?? "خطا در ثبت‌نام");
    await signIn("credentials", { redirect: false, id: form.email || form.username, password: form.password });
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-4 py-16">
      <div className="glass p-8">
        <h1 className="mb-1 text-center font-display text-2xl font-black text-white">عضویت در آرنا ایکس</h1>
        <p className="mb-8 text-center text-sm text-slate-400">۵ ثانیه تا اولین رزرو 🚀</p>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">نام و نام خانوادگی</label>
            <input value={form.name} onChange={set("name")} required className="input" placeholder="آرش رادمنش" />
          </div>
          <div>
            <label className="label">نام کاربری *</label>
            <input value={form.username} onChange={set("username")} required className="input" dir="ltr" placeholder="arash" />
          </div>
          <div>
            <label className="label">موبایل</label>
            <input value={form.phone} onChange={set("phone")} className="input" dir="ltr" placeholder="09xxxxxxxxx" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">ایمیل</label>
            <input type="email" value={form.email} onChange={set("email")} className="input" dir="ltr" placeholder="you@example.com" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">رمز عبور (حداقل ۶ کاراکتر)</label>
            <input type="password" value={form.password} onChange={set("password")} required minLength={6} className="input" dir="ltr" placeholder="••••••••" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">کد معرف (اختیاری)</label>
            <input value={form.referral} onChange={set("referral")} className="input" dir="ltr" placeholder="REF-friend" />
          </div>
          {error && <p className="sm:col-span-2 rounded-xl border border-neon-red/40 bg-neon-red/10 p-3 text-center text-xs text-neon-red">{error}</p>}
          <button disabled={busy} className="btn-neon sm:col-span-2 w-full !py-3">{busy ? "..." : "🎯 ایجاد حساب"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          قبلاً عضو شدی؟ <Link href="/login" className="font-bold text-neon-purple hover:underline">ورود</Link>
        </p>
      </div>
    </div>
  );
}
