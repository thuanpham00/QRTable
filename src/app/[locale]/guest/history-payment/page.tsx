import HistoryPaymentList from "@/app/[locale]/guest/history-payment/history-payment-list";
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
    namespace: "GuestHistoryPayment",
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/guest/history-payment`;

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

export default async function HistoryPaymentPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await params;
  setRequestLocale(locale.locale); // set ngôn ngữ cho trang này, nếu ko set thì sẽ lấy ngôn ngữ mặc định là en, dù cho url có là /vi đi nữa

  return (
    <div className="w-full mx-auto p-3 md:p-8">
      <HistoryPaymentList />
    </div>
  );
}
