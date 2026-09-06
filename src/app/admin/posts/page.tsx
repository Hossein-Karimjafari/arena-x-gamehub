import { db } from "@/lib/db";
import { dateFa } from "@/lib/constants";
import PostRow from "./PostRow";

export const dynamic = "force-dynamic";

export default async function AdminPosts() {
  const posts = await db.post.findMany({ include: { author: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <form action="/api/admin/posts" method="POST" className="glass grid gap-4 p-6 sm:grid-cols-3">
        <div className="sm:col-span-3"><h3 className="font-bold text-white">✍️ مقاله جدید</h3></div>
        <div className="sm:col-span-2"><label className="label">عنوان</label><input name="title" required className="input" /></div>
        <div><label className="label">اسلاگ</label><input name="slug" required dir="ltr" className="input" /></div>
        <div><label className="label">دسته</label><input name="category" required className="input" placeholder="اخبار گیم‌نت" /></div>
        <div><label className="label">ایموجی</label><input name="emoji" defaultValue="📰" className="input" /></div>
        <div className="sm:col-span-3"><label className="label">خلاصه</label><input name="excerpt" required className="input" /></div>
        <div className="sm:col-span-3"><label className="label">متن کامل</label><textarea name="content" required className="input min-h-32" /></div>
        <button className="btn-neon">انتشار</button>
      </form>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-white/5"><tr><th className="table-th">عنوان</th><th className="table-th">دسته</th><th className="table-th">نویسنده</th><th className="table-th">بازدید</th><th className="table-th">تاریخ</th><th className="table-th">عملیات</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="table-td"><b>{p.emoji} {p.title}</b></td>
                <td className="table-td">{p.category}</td>
                <td className="table-td text-xs">{p.author?.name ?? "—"}</td>
                <td className="table-td">{p.views}</td>
                <td className="table-td text-xs">{dateFa(p.createdAt)}</td>
                <td className="table-td"><PostRow id={p.id} published={p.published} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
