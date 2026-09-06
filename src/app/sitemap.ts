import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/games", "/booking", "/tournaments", "/pricing", "/about", "/contact", "/blog", "/leaderboard"];

  let gameRoutes: { url: string; lastModified: Date }[] = [];
  let tournamentRoutes: { url: string; lastModified: Date }[] = [];
  let postRoutes: { url: string; lastModified: Date }[] = [];
  try {
    const [games, tournaments, posts] = await Promise.all([
      db.game.findMany({ select: { slug: true, updatedAt: true } }),
      db.tournament.findMany({ select: { slug: true, updatedAt: true } }),
      db.post.findMany({ select: { slug: true, updatedAt: true }, where: { published: true } }),
    ]);
    gameRoutes = games.map((g) => ({ url: `${SITE_URL}/games/${g.slug}`, lastModified: g.updatedAt }));
    tournamentRoutes = tournaments.map((t) => ({ url: `${SITE_URL}/tournaments/${t.slug}`, lastModified: t.updatedAt }));
    postRoutes = posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt }));
  } catch {
    // DB unavailable — still emit static routes.
  }

  return [
    ...staticRoutes.map((r) => ({ url: `${SITE_URL}${r}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: r === "" ? 1 : 0.8 })),
    ...gameRoutes.map((r) => ({ ...r, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...tournamentRoutes.map((r) => ({ ...r, changeFrequency: "daily" as const, priority: 0.8 })),
    ...postRoutes.map((r) => ({ ...r, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
