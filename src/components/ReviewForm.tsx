"use client";

import { useState } from "react";
import StarRating from "@/components/StarRating";

export default function ReviewForm({ gameId, target = "GAME" }: { gameId?: string; target?: "GAME" | "SITE" }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setMsg("ابتدا امتیاز را انتخاب کن"); return; }
    setBusy(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, target, rating, comment }),
    });
    const j = await res.json();
    setBusy(false);
    if (res.ok) {
      setOk(true);
      setMsg(j.message ?? "دیدگاه شما ثبت شد و پس از تایید نمایش داده می‌شود ⭐");
      setComment("");
      setRating(0);
    } else { setOk(false); setMsg(j.error ?? "خطایی رخ داد"); }
  }

  return (
    <form onSubmit={submit} className="glass p-5">
      <h4 className="mb-4 font-bold text-white">ثبت دیدگاه و امتیاز شما</h4>
      <div className="mb-4"><StarRating value={rating} onChange={setRating} /></div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} required minLength={3} maxLength={1000}
        placeholder="تجربه‌ت رو بنویس..." className="input min-h-24" />
      {msg && <p className={`mt-2 text-xs ${ok ? "text-neon-green" : "text-neon-red"}`}>{msg}</p>}
      <button disabled={busy || !rating} className="btn-neon mt-4 !py-2.5 !text-sm disabled:opacity-40">
        {busy ? "در حال ارسال..." : "ثبت دیدگاه"}
      </button>
    </form>
  );
}
