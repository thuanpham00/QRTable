import { CardDescription, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { envConfig, Locale } from "@/utils/config";
import { Metadata } from "next";
import UpdateImport from "@/app/[locale]/manage/update-import-receipt/[id]/update-import";

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "ManageImportReceipts",
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/update-import-receipt/${params.id}`;

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

export default async function UpdateImportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale); // set ngôn ngữ cho trang này, nếu ko set thì sẽ lấy ngôn ngữ mặc định là en, dù cho url có là /vi đi nữa
  const t = await getTranslations("ManageImportReceipts");

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <CardTitle className="text-xl">{t("updateImportReceipt")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        <Suspense>
          <UpdateImport idImportReceipt={id} />
        </Suspense>
      </div>
    </main>
  );
}

/**
 * Các page như trên vẫn là SSG vì có generateStaticParams với [locale], nên Next.js sẽ build ra HTML tĩnh cho từng locale.
Tuy nhiên, phần bên trong (component con như AccountTable) được bọc bởi <Suspense> và là client component, nên chỉ render nội dung tĩnh ở lớp ngoài, còn bên trong sẽ hydrate và render ở client.
Như vậy, bạn vẫn giữ được SSG cho phần ngoài, còn phần bên trong sẽ luôn cập nhật theo trạng thái client (ví dụ: dùng hook, lấy dữ liệu động, v.v.).
 */
