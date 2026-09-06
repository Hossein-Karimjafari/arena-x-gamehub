"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toman } from "@/lib/constants";

export default function TournamentRegisterForm({
  tournamentId,
  status,
  full,
  teamSize,
  entryFee,
  seats,
  capacity,
}: {
  tournamentId: string;
  status: string;
  full: boolean;
  teamSize: number;
  entryFee: number;
  seats: number;
  capacity: number;
}) {
  const { data: session } = useSession();
  const [teamName, setTeamName] = useState("");
  const [contact, setContact] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === "DONE" || status === "ONGOING")
    return <div className="glass p-6 text-center text-sm text-slate-400">این مسابقه در حال برگزاری یا به پایان رسیده است.</div>;

  if (full || status === "FULL")
    return <div className="glass p-6 text-center"><p className="font-bold text-neon-red">ظرفیت تکمیل شده 😔</p><p className="mt-1 text-xs text-slate-400">برای مسابقه بعدی هشدار می‌گیریم!</p></div>;

  if (!session)
    return (
      <div className="glass p-6 text-center">
        <p className="mb-3 text-sm text-slate-300">برای ثبت‌نام در مسابقه ابتدا وارد حساب شو.</p>
        <Link href="/login" className="btn-neon !py-2.5 !text-sm">ورود / عضویت</Link>
      </div>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName: teamName || undefined, contact }),
    });
    const j = await res.json();
    setBusy(false);
    setMsg(res.ok ? "✅ ثبت‌نام انجام شد! جزئیات به اعلان‌هایت اضافه شد." : "❌ " + (j.error ?? "خطا"));
  }

  return (
    <form onSubmit={submit} className="glass p-6">
      <h3 className="mb-4 font-black text-white">📝 فرم ثبت‌نام</h3>
      {teamSize > 1 && (
        <div className="mb-4">
          <label className="label">نام تیم</label>
          <input value={teamName} onChange={(e) => setTeamName(e.target.value)} required className="input" placeholder="مثلاً NoScope" />
        </div>
      )}
      <div className="mb-4">
        <label className="label">شماره تماس / آیدی اطلاع‌رسانی</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} required className="input" placeholder="09xxxxxxxxx یا آیدی تلگرام" />
      </div>
      {entryFee > 0 && (
        <div className="mb-4 rounded-xl border border-neon-green/30 bg-neon-green/10 p-3 text-sm text-neon-green">
          هزینه ثبت‌نام: <b>{toman(entryFee)}</b> — پرداخت در محل یا از کیف پول (با هماهنگی اپراتور)
        </div>
      )}
      <button disabled={busy} className="btn-neon w-full !py-3">{busy ? "در حال ثبت..." : `ثبت‌نام (${seats}/${capacity})`}</button>
      {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
    </form>
  );
}
