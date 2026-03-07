import MenuOrder from "@/app/[locale]/guest/menu/menu-order";
import { baseOpenGraph } from "@/shared-metadata";
import { envConfig, Locale } from "@/utils/config";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// dùng api generateMetadata khi cần dịch - còn không cần dịch thì dùng metaData tĩnh
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "GuestMenu",
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/guest/menu`;

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      ...baseOpenGraph,
      title: t("title"),
      description: t("description"),
      url,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: false,
    },
  };
}

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await params;
  setRequestLocale(locale.locale); // set ngôn ngữ cho trang này, nếu ko set thì sẽ lấy ngôn ngữ mặc định là en, dù cho url có là /vi đi nữa

  return (
    <div className="w-full mx-auto p-1 md:p-8">
      <MenuOrder />
    </div>
  );
}
