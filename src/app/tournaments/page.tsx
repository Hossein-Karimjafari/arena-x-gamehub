import { db } from "@/lib/db";
import TournamentCard from "@/components/TournamentCard";
import SectionHeading from "@/components/SectionHeading";

export const dynamic = "force-dynamic";
export const metadata = { title: "مسابقات", description: "تورنمنت‌های فیفا، ولورنت، CS2 و دوتا با جوایز نقدی در گیم‌نت آرنا ایکس" };

export default async function TournamentsPage() {
  const tournaments = await db.tournament.findMany({ orderBy: { date: "asc" } });
  const open = tournaments.filter((t) => t.status === "OPEN" || t.status === "FULL");
  const done = tournaments.filter((t) => t.status === "ONGOING" || t.status === "DONE");

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeading kicker="TOURNAMENTS" title="🏆 مسابقات آرنا ایکس" desc="ثبت‌نام آنلاین، جوایز واقعی، پخش زنده. تیم‌ات را ببند و بجنگ!" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {open.map((t) => <TournamentCard key={t.id} t={t} />)}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="section-title mb-6 mt-16 text-xl">ادامه رقابت‌ها و گذشته</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {done.map((t) => <TournamentCard key={t.id} t={t} />)}
          </div>
        </>
      )}

      <div className="glass mt-14 grid gap-6 p-8 text-center sm:grid-cols-3">
        {[
          ["📅", "هر هفته", "لیگ‌های CS2 و شب‌گیم‌های جمعه"],
          ["💰", "جایزه نقدی", "تا ۱۰ میلیون تومان برای تیم قهرمان"],
          ["🎥", "پخش زنده", "کامنت ری‌اکشن و کلیپ بهترین لحظات"],
        ].map(([e, t, d]) => (
          <div key={t}>
            <p className="mb-2 text-3xl">{e}</p>
            <p className="font-bold text-white">{t}</p>
            <p className="mt-1 text-xs text-slate-400">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
