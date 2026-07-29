import type { MetadataRoute } from "next";

const ORIGIN = "https://www.bsites.io";

/** Public marketing URLs for Google Search Console. */
const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
  { path: "/preview", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/mission", changeFrequency: "monthly", priority: 0.6 },
  { path: "/mission/ourTeam", changeFrequency: "monthly", priority: 0.5 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${ORIGIN}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
