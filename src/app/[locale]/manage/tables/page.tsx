import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TableTable from "@/app/[locale]/manage/tables/table-table";
import { Suspense } from "react";
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
    namespace: "ManageTables",
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/tables`;

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

export default async function TablesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale);
  const t = await getTranslations("ManageTables");

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
              <TableTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
