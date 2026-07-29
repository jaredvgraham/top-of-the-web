import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/billing",
          "/thank-you",
          "/onboarding",
          "/preview/continue",
          "/preview/*/claim",
        ],
      },
    ],
    sitemap: "https://www.bsites.io/sitemap.xml",
    host: "https://www.bsites.io",
  };
}
