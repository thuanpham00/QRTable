import { menuApiRequests } from "@/apiRequests/menu";
import { Badge } from "@/components/ui/badge";
import { MenuItemStatus } from "@/constants/type";
import { formatCurrency, wrapServerApi } from "@/lib/utils";
import { MenuActiveResType } from "@/schemaValidations/menu.schema";
import Image from "next/image";
import bgLogin from "../../../../../public/images/food_example.jpg";
import logoFavourite from "../../../../../public/images/favorites.png";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale);
  const t = await getTranslations("Others");
  const t2 = await getTranslations("MenuPage");
  let menuActive: MenuActiveResType["data"] | null = null;

  const resultMenuActive = await wrapServerApi(() => menuApiRequests.menuActive());
  menuActive = resultMenuActive?.payload.data || null;

  const resultSuggested = await wrapServerApi(() => menuApiRequests.getMenuSuggested());
  const listDishSuggested = resultSuggested?.payload.data;

  if (!menuActive || menuActive.menuItems.length === 0) {
    return <div className="text-center py-10">{t2("NoMenuActive")}</div>;
  }

  const groupedByCategory = menuActive.menuItems.reduce(
    (acc, menuItem) => {
      if (menuItem.status === MenuItemStatus.HIDDEN) return acc;
      const categoryName = menuItem.dish.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(menuItem);
      return acc;
    },
    {} as Record<string, typeof menuActive.menuItems>,
  );

  const groupedByCategoryAndTry: Record<string, typeof menuActive.menuItems> = {
    ...groupedByCategory,
    ...{ "Nên thử": listDishSuggested || [] },
  };

  const groupedByCategoryAndTrySort = Object.entries(groupedByCategoryAndTry).sort(([a], [b]) => {
    if (a === "Nên thử") return -1;
    if (b === "Nên thử") return 1;
    return a.localeCompare(b);
  });

  return (
    <section className="space-y-10 p-4 md:p-8">
      <div
        className="text-center space-y-4 p-20 sm:p-40 rounded-xl"
        style={{
          backgroundImage: `url(${bgLogin.src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <h2 className="text-3xl font-bold text-white dark:text-primary">{menuActive.name}</h2>
        {menuActive.description && <p className="text-white max-w-2xl mx-auto">{menuActive.description}</p>}
        <div className="flex items-center justify-center">
          <Badge variant="default">{menuActive.menuItems.length} món ăn</Badge>
        </div>
      </div>

      <div className="space-y-16">
        {groupedByCategoryAndTrySort.map(([categoryName, items]) => (
          <div key={categoryName} className="space-y-6">
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2">
                  {categoryName === "Nên thử" && (
                    <Image
                      src={logoFavourite.src}
                      alt="favorites"
                      width={50}
                      height={50}
                      className="inline-block"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{categoryName}</h3>
                    <p className="text-sm text-muted-foreground">{items.length} món ăn</p>
                  </div>
                </div>
                <div className="hidden md:block flex-1 h-px bg-linear-to-r from-border to-transparent"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-6">
              {items.map((menuItem) => {
                const dish = menuItem.dish;

                return (
                  <Link
                    className="group relative flex flex-col bg-gray-50 dark:bg-border shadow border border-border transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 cursor-pointer overflow-hidden rounded-lg"
                    key={menuItem.id}
                    href={`/dishes/${menuItem.id}`}
                  >
                    <div className="relative overflow-hidden h-48 bg-muted">
                      <Image
                        alt={dish.name}
                        src={dish.image}
                        width={400}
                        height={300}
                        unoptimized
                        className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-3 space-y-1 flex-1 flex flex-col">
                      <div className="space-y-1 flex-1">
                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                          {dish.name}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold text-white bg-linear-to-r from-orange-500 to-amber-500 inline-block px-3 py-1 rounded-lg shadow-lg">
                            {formatCurrency(dish.price)}
                          </div>
                          <div className="text-xs text-gray-700 dark:text-primary font-semibold">
                            {t("seenDetail")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
