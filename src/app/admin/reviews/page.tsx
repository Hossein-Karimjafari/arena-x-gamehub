import { db } from "@/lib/db";
import { dateFa } from "@/lib/constants";
import ReviewRow from "./ReviewRow";

export const dynamic = "force-dynamic";

export default async function AdminReviews() {
  const reviews = await db.review.findMany({
    include: { user: { select: { name: true, username: true } }, game: { select: { title: true, slug: true } } },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-white">💬 مدیریت دیدگاه‌ها</h3>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className={`glass flex flex-wrap items-start justify-between gap-3 p-4 ${r.approved ? "" : "border-r-2 border-neon-pink"}`}>
            <div className="min-w-0">
              <p className="text-sm">
                <b className="text-white">{r.user.name ?? r.user.username}</b>
                <span className="text-slate-500"> • {r.game ? r.game.title : "درباره سایت"}</span>
                <span className="text-neon-purple"> • {"★".repeat(r.rating)}</span>
                {r.approved ? "" : <span className="text-neon-pink"> • در انتظار تایید</span>}
              </p>
              <p className="mt-1 text-xs leading-6 text-slate-300">{r.comment}</p>
              <p className="mt-1 text-[10px] text-slate-500">{dateFa(r.createdAt)}</p>
            </div>
            <ReviewRow id={r.id} approved={r.approved} />
          </div>
        ))}
        {reviews.length === 0 && <p className="glass p-6 text-sm text-slate-400">دیدگاهی ثبت نشده.</p>}
      </div>
    </div>
  );
}
