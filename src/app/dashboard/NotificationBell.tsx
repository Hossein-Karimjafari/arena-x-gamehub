"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationBell({ notifs }: { notifs: { id: string; title: string; body: string; read: boolean; createdAt: string }[] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifs);
  const router = useRouter();
  const unread = items.filter((n) => !n.read).length;

  async function toggle() {
    const next = !open;
    setOpen(next);
    // When opening with unread notifications, mark them read server-side.
    if (next && unread > 0) {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      await fetch("/api/notifications/read", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
      router.refresh();
    }
  }

  return (
    <div className="glass p-6">
      <button onClick={toggle} className="flex w-full items-center justify-between" aria-expanded={open}>
        <h3 className="font-black text-white">🔔 اعلان‌ها</h3>
        {unread > 0 && <span className="rounded-full bg-neon-pink px-2 py-0.5 text-[10px] font-black text-white">{unread} جدید</span>}
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          {items.map((n) => (
            <div key={n.id} className={`rounded-xl p-3 text-sm ${n.read ? "bg-white/5 text-slate-400" : "bg-neon-purple/10 text-slate-200"}`}>
              <p className="font-bold">{n.title}</p>
              <p className="mt-1 text-xs leading-6">{n.body}</p>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-400">اعلانی نداری.</p>}
        </div>
      )}
    </div>
  );
}
