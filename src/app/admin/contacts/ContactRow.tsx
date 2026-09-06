"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactRow({ id, answered }: { id: string; answered: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    await fetch("/api/admin/contacts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, answered: !answered }) });
    setBusy(false);
    router.refresh();
  }

  return (
    <button disabled={busy} onClick={toggle} className="rounded-lg border border-white/20 px-2 py-1 text-[10px] text-slate-300 hover:border-neon-green/50">
      {answered ? "علامت پاسخ‌داده‌نشده" : "پاسخ داده شد ✓"}
    </button>
  );
}
