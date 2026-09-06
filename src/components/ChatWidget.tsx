"use client";

import { useState } from "react";
import { SITE } from "@/lib/constants";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([
    { me: false, text: `سلام! به پشتیبانی ${SITE.name} خوش اومدی 👋 سوالت رو بپرس یا از این‌ها انتخاب کن:` },
  ]);
  const [val, setVal] = useState("");

  const quick = ["چطور رزرو کنم؟", "قیمت‌ها چقدره؟", "ساعت کاری؟", "آدرس کجاست؟"];

  const reply = (q: string) => {
    if (q.includes("رزرو")) return "برای رزرو، از دکمه «رزرو آنلاین» در منو استفاده کن؛ دستگاه، تاریخ و ساعت رو انتخاب می‌کنی و در چند ثانیه ثبت میشه ✅";
    if (q.includes("قیمت")) return "پلن ساعتی از ۱۵۰ هزار تومان شروع میشه و اشتراک ماهانه تا ۴۵٪ به‌صرفه‌تره! صفحه «تعرفه‌ها» رو ببین 🏷️";
    if (q.includes("ساعت")) return "هر روز ۹ صبح تا ۱۲ شب بازیم؛ جمعه‌ها هم ۲۴ ساعته! 🕘";
    if (q.includes("آدرس")) return `آدرس ما: ${SITE.address} 📍`;
    return "پیامت ثبت شد! اپراتورهای ما در ساعات کاری خیلی سریع جواب میدن. همچنین می‌تونی واتساپ بزنی 💬";
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { me: true, text }]);
    setVal("");
    setTimeout(() => setMsgs((m) => [...m, { me: false, text: reply(text) }]), 600);
  };

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {open && (
        <div className="glass mb-3 w-80 overflow-hidden shadow-neon">
          <div className="flex items-center justify-between border-b border-white/10 bg-neon-violet/20 px-4 py-3">
            <span className="text-sm font-bold text-white">پشتیبانی آنلاین</span>
            <span className="chip !py-0.5 !text-[10px] !text-neon-green">● آنلاین</span>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-6 ${m.me ? "ml-auto bg-neon-purple/30 text-white" : "bg-white/10 text-slate-200"}`}>
                {m.text}
              </div>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quick.map((q) => (
                <button key={q} onClick={() => send(q)} className="chip hover:!border-neon-cyan/50">{q}</button>
              ))}
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(val); }} className="flex gap-2 border-t border-white/10 p-3">
            <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="پیام شما..." className="input !py-2 !text-xs" />
            <button className="btn-neon !px-3 !py-2 !text-xs">➤</button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-neon-violet to-neon-purple text-2xl shadow-neon transition-transform hover:scale-110"
        aria-label="چت پشتیبانی"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
