import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Clock, Flame, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { MenuItemResType } from "@/schemaValidations/menu.schema";
import { getTranslations } from "next-intl/server";

const getSpicy = (value: number, t: (key: string) => string) => {
  switch (value) {
    case 0:
      return t("spicyNone");
    case 1:
      return t("spicyMild");
    case 2:
      return t("spicyMedium");
    case 3:
      return t("spicyHot");
    default:
      return t("spicyNone");
  }
};

const getSpicyLevel = (level: number) => {
  return Array.from({ length: level }, (_, i) => (
    <Flame key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
  ));
};

const getStatusBadge = (status: string, t: (key: string) => string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: Record<string, { variant: any; label: string }> = {
    Available: { variant: "default", label: t("statusAvailable") },
    OutOfStock: { variant: "destructive", label: t("statusOutOfStock") },
    Hidden: { variant: "secondary", label: t("statusHidden") },
  };
  return variants[status] || { variant: "secondary", label: status };
};

const getDishStatusBadge = (status: string, t: (key: string) => string) => {
  return status === "Active"
    ? { variant: "default" as const, label: t("dishStatusActive") }
    : { variant: "secondary" as const, label: t("dishStatusInactive") };
};

export default async function DishDetail({ dish }: { dish: MenuItemResType["data"] }) {
  const { dish: dishData, price, status } = dish;
  const t = await getTranslations("DishDetail");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={dishData.image}
            alt={dishData.name}
            width={800}
            height={800}
            className="object-cover w-full h-full"
            priority
            title={dishData.name}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-orange-500 px-4 py-1">
                {dishData.category.name}
              </Badge>
              <Badge {...getStatusBadge(status, t)} />
              <Badge {...getDishStatusBadge(dishData.status, t)} />
            </div>
            <h1 className="text-4xl font-bold mb-2">{dishData.name}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{price.toLocaleString("vi-VN")}₫</span>
              {price !== dish.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {dish.price.toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">{t("description")}</h2>
            <p className="text-muted-foreground leading-relaxed">{dishData.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">{t("prepTime")}</div>
                <div className="font-semibold">{t("minutes", { value: dishData.preparationTime })}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <div className="flex gap-1">{getSpicyLevel(dishData.spicyLevel)}</div>
              <div>
                <div className="text-sm text-muted-foreground">{t("spicyLevel")}</div>
                <div className="font-semibold">{getSpicy(dishData.spicyLevel, t)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">{t("popularity")}</div>
                <div className="font-semibold">{dishData.popularity}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">{t("mainIngredients")}</div>
                <div className="font-semibold">{dishData.ingredients?.join(", ")}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
          <p>
            {t("searchKeywords")} <span className="text-foreground">{dishData.searchKeywords}</span>
          </p>
          <p>
            {t("lastUpdated")}{" "}
            <span className="text-foreground">
              {format(new Date(dishData.updatedAt), "dd/MM/yyyy HH:mm")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
