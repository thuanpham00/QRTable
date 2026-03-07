import GuestLoginForm from "@/app/[locale]/(public)/tables/[number]/guest-login-form";
import bgLogin from "../../../../../../public/images/restaurant.png";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { envConfig, Locale } from "@/utils/config";
import { Metadata } from "next";
import { baseOpenGraph } from "@/shared-metadata";

type Props = {
  params: Promise<{ number: string; locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "LoginGuest",
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/tables/${params.number}`;

  return {
    title: `No ${params.number} | ${t("title")}`,
    description: t("description"),
    openGraph: {
      ...baseOpenGraph,
      title: `No ${params.number} | ${t("title")}`,
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

export default async function TableNumberPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale);

  return (
    <div className="relative">
      <div
        style={{
          backgroundImage: `url(${bgLogin.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "calc(100vh - 64px)",
          filter: "brightness(0.7)",
        }}
        className="absolute z-1 inset-0"
      ></div>
      <div className="absolute z-2 inset-0 top-5">
        <Suspense>
          <GuestLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
