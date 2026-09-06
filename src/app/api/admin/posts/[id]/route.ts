import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { bad, apiError } from "@/lib/api-helpers";

const POST_FIELDS = ["title", "slug", "excerpt", "content", "category", "emoji", "published"] as const;

function pickPatch(patch: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const k of POST_FIELDS) if (k in patch) data[k] = patch[k];
  if (typeof data.slug === "string") data.slug = data.slug.trim().toLowerCase();
  if ("published" in data) data.published = Boolean(data.published);
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    const patch = (await req.json()) as Record<string, unknown>;
    await db.post.update({ where: { id }, data: pickPatch(patch) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    await db.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
