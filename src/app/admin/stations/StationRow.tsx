"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StationRow({ id, hourlyRate, active, online }: { id: string; hourlyRate: number; active: boolean; online: boolean }) {
  const [rate, setRate] = useState(String(hourlyRate));
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/stations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setBusy(false);
    router.refresh();
  }
  async function remove() {
    if (!confirm("دستگاه حذف شود؟")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/stations/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "حذف ممکن نشد");
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <input value={rate} onChange={(e) => setRate(e.target.value)} className="input !w-24 !px-2 !py-1 !text-xs" dir="ltr" />
      <button disabled={busy} onClick={() => patch({ hourlyRate: Number(rate) })} className="rounded-lg border border-neon-cyan/40 px-2 py-1 text-[10px] text-neon-cyan hover:bg-neon-cyan/10">نرخ</button>
      <button disabled={busy} onClick={() => patch({ active: !active })} className="rounded-lg border border-white/20 px-2 py-1 text-[10px] text-slate-300">{active ? "خاموش" : "روشن"}</button>
      <button disabled={busy} onClick={() => patch({ online: !online })} className="rounded-lg border border-white/20 px-2 py-1 text-[10px] text-slate-300">{online ? "آفلاین" : "آنلاین"}</button>
      <button disabled={busy} onClick={remove} className="rounded-lg border border-neon-red/40 px-2 py-1 text-[10px] text-neon-red">حذف</button>
    </div>
  );
}
