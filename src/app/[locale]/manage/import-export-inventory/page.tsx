import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { envConfig, Locale } from "@/utils/config";
import { Metadata } from "next";
import ImportExportInventory from "@/app/[locale]/manage/import-export-inventory/import-export-inventory";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "ManageImportExportInventory",
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/import-export-inventory`;

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

export default async function ImportExportInventoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale); // set ngôn ngữ cho trang này, nếu ko set thì sẽ lấy ngôn ngữ mặc định là en, dù cho url có là /vi đi nữa
  const t = await getTranslations("ManageImportExportInventory");

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <h1 className="text-xl">{t("title")}</h1>
        <h2>{t("description")}</h2>
        <Suspense>
          {/* ngăn lỗi useSearchParams nên dùng Suspense */}
          <ImportExportInventory />
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
