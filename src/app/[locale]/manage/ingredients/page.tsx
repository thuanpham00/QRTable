import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import IngredientTable from "@/app/[locale]/manage/ingredients/ingredient-table";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { envConfig, Locale } from "@/utils/config";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "ManageIngredients",
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/ingredients`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: url,
    },
    robots: {
      index: false, // chặn trạng này không được index bởi công cụ tìm kiếm (là google không index trang này vào kết quả tìm kiếm)
    },
  };
}

export default async function IngredientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale); // set ngôn ngữ cho trang này, nếu ko set thì sẽ lấy ngôn ngữ mặc định là en, dù cho url có là /vi đi nữa
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
