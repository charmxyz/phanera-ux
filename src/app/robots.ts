import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/blog";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api", "/auth", "/r/", "/promo"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
