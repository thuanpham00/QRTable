import { envConfig } from "@/utils/config";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${envConfig.NEXT_PUBLIC_URL}/sitemap.xml`,
  };
}

// File robots.ts trong Next.js dùng để tạo tự động file /robots.txt — là file hướng dẫn cho các search engine bot (Googlebot, Bingbot...) biết cách crawl website.