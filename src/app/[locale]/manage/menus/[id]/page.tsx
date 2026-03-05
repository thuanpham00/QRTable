import MenuDetail from "@/app/[locale]/manage/menus/[id]/menu-detail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

export default async function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("ManageMenus");
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle className="text-xl">{t("menuDetailTitle", { id })}</CardTitle>
            <CardDescription>{t("menuDetailDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <MenuDetail />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
