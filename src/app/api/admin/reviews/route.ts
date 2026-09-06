import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { bad, apiError, safeJson } from "@/lib/api-helpers";

/** GET: pending reviews for moderation */
export async function GET() {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  const reviews = await db.review.findMany({
    where: { approved: false },
    include: { user: { select: { name: true, username: true } }, game: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reviews });
}

/** PATCH: approve or reject ({ id, approved: boolean }) */
export async function PATCH(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const body = await safeJson<{ id?: string; approved?: boolean }>(req);
    if (!body?.id || typeof body.approved !== "boolean") return bad("id و approved الزامی است");

    const review = await db.$transaction(async (tx) => {
      const r = await tx.review.update({ where: { id: body.id! }, data: { approved: body.approved! } });
      if (r.gameId) {
        const agg = await tx.review.aggregate({ where: { gameId: r.gameId, approved: true }, _avg: { rating: true } });
        await tx.game.update({ where: { id: r.gameId }, data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10 } });
      }
      return r;
    });
    return NextResponse.json({ ok: true, review });
  } catch (e) {
    return apiError(e);
  }
}

/** DELETE: remove a review */
export async function DELETE(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return bad("id لازم است");
    const r = await db.review.delete({ where: { id } });
    if (r.gameId) {
      const agg = await db.review.aggregate({ where: { gameId: r.gameId, approved: true }, _avg: { rating: true } });
      await db.game.update({ where: { id: r.gameId }, data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10 } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
