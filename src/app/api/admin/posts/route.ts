import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { bad, apiError } from "@/lib/api-helpers";
import { slugRe } from "@/lib/validation";

const POST_FIELDS = ["title", "slug", "excerpt", "content", "category", "emoji", "published"] as const;

function pickPatch(patch: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const k of POST_FIELDS) if (k in patch) data[k] = patch[k];
  if (typeof data.slug === "string") data.slug = data.slug.trim().toLowerCase();
  if ("published" in data) data.published = Boolean(data.published);
  return data;
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const fd = await req.formData();
    const g = (k: string) => (fd.get(k)?.toString() ?? "").trim();
    const slug = g("slug").toLowerCase();
    if (!slug || !slugRe.test(slug)) return bad("اسلاگ نامعتبر است (حروف انگلیسی کوچک و خط تیره)");
    if (!g("title") || !g("content")) return bad("عنوان و محتوا الزامی است");

    await db.post.create({
      data: {
        title: g("title"), slug, excerpt: g("excerpt") || g("content").slice(0, 140), content: g("content"),
        category: g("category") || "اخبار", emoji: g("emoji") || "📰", authorId: session.user.id,
      },
    });
    return NextResponse.redirect(new URL("/admin/posts", req.url), { status: 303 });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id, ...patch } = (await req.json()) as { id?: string } & Record<string, unknown>;
    if (!id) return bad("id لازم است");
    await db.post.update({ where: { id }, data: pickPatch(patch) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return bad("id لازم است");
    await db.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
