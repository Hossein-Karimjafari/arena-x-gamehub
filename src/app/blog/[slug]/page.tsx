import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dateFa } from "@/lib/constants";
import CoverArt from "@/components/CoverArt";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  return { title: post?.title ?? "مقاله", description: post?.excerpt };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug }, include: { author: true } });
  if (!post) notFound();

  await db.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
  const related = await db.post.findMany({ where: { category: post.category, id: { not: post.id } }, take: 3 });

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <nav className="mb-6 text-xs text-slate-500">
        <Link href="/" className="hover:text-neon-purple">خانه</Link> / <Link href="/blog" className="hover:text-neon-purple">اخبار</Link> / <span className="text-slate-300">{post.title}</span>
      </nav>

      <CoverArt emoji={post.emoji} src={`/images/blog/${post.slug}.webp`} gradient="violet" className="mb-8 h-64 !rounded-3xl shadow-neon" big alt={post.title} />

      <span className="chip mb-3 !text-neon-purple">{post.category}</span>
      <h1 className="mb-3 font-display text-3xl font-black leading-snug text-white">{post.title}</h1>
      <p className="mb-8 text-xs text-slate-500">
        {post.author?.name ?? "تحریریه آرنا"} • {dateFa(post.createdAt)} • {post.views} بازدید
      </p>

      <div className="space-y-5 leading-9 text-slate-300">
        {post.content.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="mt-10 flex flex-wrap gap-2 border-t border-white/5 pt-6">
        <span className="text-sm text-slate-500">اشتراک‌گذاری:</span>
        {["تلگرام", "واتساپ", "کپی لینک"].map((s) => <span key={s} className="chip cursor-pointer hover:!border-neon-purple/60">{s}</span>)}
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title mb-6 text-xl">مطالب مرتبط</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="glass card-hover p-4">
                <p className="text-2xl">{r.emoji}</p>
                <p className="mt-2 line-clamp-2 text-sm font-bold text-white">{r.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
