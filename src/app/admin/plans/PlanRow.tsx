"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlanRow({ id, active }: { id: string; active: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    await fetch(`/api/admin/plans/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    setBusy(false);
    router.refresh();
  }

  return (
    <button disabled={busy} onClick={toggle} className={`rounded-lg border px-2 py-1 text-[10px] ${active ? "border-neon-green/40 text-neon-green" : "border-white/20 text-slate-500"}`}>
      {active ? "فعال" : "غیرفعال"}
    </button>
  );
}
