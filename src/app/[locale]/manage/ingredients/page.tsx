import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import IngredientTable from "@/app/[locale]/manage/ingredients/ingredient-table";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function IngredientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale);
  const t = await getTranslations("ManageIngredients");

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle className="text-xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              {/* ngăn lỗi useSearchParams nên dùng Suspense */}
              <IngredientTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
