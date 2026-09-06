"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostRow({ id, published }: { id: string; published: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    await fetch(`/api/admin/posts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }) });
    setBusy(false);
    router.refresh();
  }
  async function remove() {
    if (!confirm("این مقاله حذف شود؟")) return;
    setBusy(true);
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      <button disabled={busy} onClick={toggle} className={`rounded-lg border px-2 py-1 text-[10px] ${published ? "border-neon-green/40 text-neon-green" : "border-white/20 text-slate-500"}`}>
        {published ? "منتشرشده" : "پیش‌نویس"}
      </button>
      <button disabled={busy} onClick={remove} className="rounded-lg border border-neon-red/40 px-2 py-1 text-[10px] text-neon-red">حذف</button>
    </div>
  );
}
