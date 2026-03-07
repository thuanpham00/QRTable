import { menuApiRequests } from "@/apiRequests/menu";
import { generateSlugUrl } from "@/lib/utils";
import { envConfig, locales } from "@/utils/config";
import type { MetadataRoute } from "next";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: "",
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: "/login",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  {
    url: "/menu",
    changeFrequency: "yearly",
    priority: 0.
  },
  {
    url: "/about",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  {
    url: "/privacy-policy",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  {
    url: "/terms-of-service",
    changeFrequency: "yearly",
    priority: 0.5,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await menuApiRequests.menuActive();

  const dishList = result.payload.data.menuItems;
  const localizeStaticSiteMap = locales.reduce((acc, locale) => {
    return [
      ...acc,
      ...staticRoutes.map((route) => {
        return {
          ...route,
          url: `${envConfig.NEXT_PUBLIC_URL}/${locale}${route.url}`,
          lastModified: new Date(),
        };
      }),
    ];
  }, [] as MetadataRoute.Sitemap);
  const localizeDishSiteMap = locales.reduce((acc, locale) => {
    const dishListSiteMap: MetadataRoute.Sitemap = dishList.map((dish) => {
      return {
        url: `${envConfig.NEXT_PUBLIC_URL}/${locale}/dishes/${generateSlugUrl({
          id: dish.id,
          name: dish.dish.name,
        })}`,
        lastModified: dish.updatedAt,
        changeFrequency: "weekly",
        priority: 0.9,
      };
    });
    return [...acc, ...dishListSiteMap];
  }, [] as MetadataRoute.Sitemap);
  return [...localizeStaticSiteMap, ...localizeDishSiteMap];
}

// File sitemap.ts trong Next.js tự động tạo file /sitemap.xml — giúp search engine biết toàn bộ các URL cần index (hiển thị) trên website.
