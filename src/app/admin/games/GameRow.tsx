"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GameRow({ id, popular, active }: { id: string; popular: boolean; active: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function patch(patch: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/games/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setBusy(false);
    router.refresh();
  }
  async function remove() {
    if (!confirm("این بازی حذف شود؟")) return;
    setBusy(true);
    await fetch(`/api/admin/games/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      <button disabled={busy} onClick={() => patch({ popular: !popular })} className="rounded-lg border border-neon-purple/40 px-2 py-1 text-[10px] text-neon-purple hover:bg-neon-purple/10">محبوب</button>
      <button disabled={busy} onClick={() => patch({ active: !active })} className="rounded-lg border border-white/20 px-2 py-1 text-[10px] text-slate-300">{active ? "غیرفعال" : "فعال"}</button>
      <button disabled={busy} onClick={remove} className="rounded-lg border border-neon-red/40 px-2 py-1 text-[10px] text-neon-red">حذف</button>
    </div>
  );
}
