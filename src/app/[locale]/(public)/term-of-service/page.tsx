import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function TermsOfService({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale);
  const t = await getTranslations("TermOfServicePage");

  return (
    <div className="w-full flex justify-center bg-secondary">
      <div className="w-full max-w-7xl flex flex-col">
        <section className="py-16 px-4 sm:px-8 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl text-primary mb-4">{t("title")}</h1>
            <p className="mt-2 text-lg md:text-xl text-muted-foreground">{t("description")}</p>
          </div>
        </section>
        <section className="py-10 md:py-16 lg:py-8 px-4 sm:px-8 lg:px-16 xl:px-24">
          <div className="max-w-4xl mx-auto space-y-16">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">{t("introTitle")}</h2>
              <p className="mt-2 text-muted-foreground leading-8 text-base md:text-lg">{t("introContent")}</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">{t("usageTitle")}</h2>
              <p className="mt-2 text-muted-foreground leading-8 text-base md:text-lg">{t("usageContent")}</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">{t("ipTitle")}</h2>
              <p className="mt-2 text-muted-foreground leading-8 text-base md:text-lg">{t("ipContent")}</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">{t("changeTitle")}</h2>
              <p className="mt-2 text-muted-foreground leading-8 text-base md:text-lg">
                {t("changeContent")}
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">{t("contactTitle")}</h2>
              <p className="mt-2 text-muted-foreground leading-8 text-base md:text-lg">
                {t("contactContent")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
