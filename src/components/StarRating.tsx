"use client";

import { useState } from "react";

export default function StarRating({ value, onChange }: { value?: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const v = onChange ? hover || value || 0 : value ?? 0;
  return (
    <div className="flex gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`text-2xl transition-transform ${onChange ? "cursor-pointer hover:scale-125" : "cursor-default"} ${i <= v ? "text-neon-green drop-shadow-[0_0_6px_rgba(74,222,128,.6)]" : "text-slate-600"}`}
          aria-label={`${i} ستاره`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
