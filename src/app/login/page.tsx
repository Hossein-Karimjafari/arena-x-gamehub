"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("credentials", { redirect: false, id, password });
    setBusy(false);
    if (res?.error) setError("ایمیل/نام کاربری یا رمز عبور اشتباه است");
    else router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20">
      <div className="glass p-8">
        <h1 className="mb-1 text-center font-display text-2xl font-black text-white">ورود به آرنا</h1>
        <p className="mb-8 text-center text-sm text-slate-400">دوباره به میدان برگشتی! 🎮</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">ایمیل یا نام کاربری</label>
            <input value={id} onChange={(e) => setId(e.target.value)} required className="input" dir="ltr" placeholder="arash یا arash@example.com" />
          </div>
          <div>
            <label className="label">رمز عبور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input" dir="ltr" placeholder="••••••••" />
          </div>
          {error && <p className="rounded-xl border border-neon-red/40 bg-neon-red/10 p-3 text-center text-xs text-neon-red">{error}</p>}
          <button disabled={busy} className="btn-neon w-full !py-3">{busy ? "در حال ورود..." : "ورود"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          حساب نداری؟ <Link href="/register" className="font-bold text-neon-purple hover:underline">عضو شو</Link>
        </p>
        <p className="mt-3 text-center text-sm text-slate-400">
          رمزت را فراموش کردی؟ <Link href="/forgot-password" className="text-neon-cyan hover:underline">بازیابی رمز</Link>
        </p>
      </div>
    </div>
  );
}
