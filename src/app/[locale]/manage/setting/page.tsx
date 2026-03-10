import ChangePasswordForm from "@/app/[locale]/manage/setting/change-password-form";
import UpdateProfileForm from "@/app/[locale]/manage/setting/update-profile-form";
import { Badge } from "@/components/ui/badge";
import { envConfig, Locale } from "@/utils/config";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "Setting",
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/setting`;

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

export default async function Setting({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale); // set ngôn ngữ cho trang này, nếu ko set thì sẽ lấy ngôn ngữ mặc định là en, dù cho url có là /vi đi nữa
  const t = await getTranslations("Setting");

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {t("title")}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            Owner
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8">
          <UpdateProfileForm />
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
