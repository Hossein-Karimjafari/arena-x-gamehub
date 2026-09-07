import Link from "next/link";
import { db } from "@/lib/db";
import { dateFa } from "@/lib/constants";
import CoverArt from "@/components/CoverArt";
import SectionHeading from "@/components/SectionHeading";
import BlogSearch from "./BlogSearch";

export const dynamic = "force-dynamic";
export const metadata = { title: "اخبار و مقالات", description: "آخرین اخبار گیم‌نت آرنا ایکس، معرفی بازی‌ها و مقالات گیمینگ" };

export default async function BlogPage({ searchParams }: { searchParams: { q?: string; cat?: string } }) {
  const { q, cat } = await searchParams;
  const posts = await db.post.findMany({
    where: {
      published: true,
      ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] } : {}),
      ...(cat ? { category: cat } : {}),
    },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = [...new Set((await db.post.findMany({ select: { category: true } })).map((p) => p.category))];
  const gradients = ["purple", "cyan", "green", "pink", "violet", "orange"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeading kicker="BLOG" title="📰 اخبار و مقالات" desc="از تورنمنت‌ها تا راهنمای بازی‌ها؛ همه‌چی اینجا هست." />
      <BlogSearch categories={categories} />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="glass card-hover group overflow-hidden">
            <CoverArt emoji={p.emoji} src={`/images/blog/${p.slug}.jpg`} gradient={gradients[i % gradients.length]} className="h-40 transition-transform duration-500 group-hover:scale-105" alt={p.title} />
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="chip !py-0.5 !text-[10px] !text-neon-purple">{p.category}</span>
                <span>{dateFa(p.createdAt)}</span>
              </div>
              <h3 className="mb-2 font-bold leading-7 text-white group-hover:text-neon-purple transition-colors">{p.title}</h3>
              <p className="line-clamp-2 text-sm leading-7 text-slate-400">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      {posts.length === 0 && <div className="glass mt-8 p-12 text-center text-slate-400">مطلبی پیدا نشد 📭</div>}
    </div>
  );
}
