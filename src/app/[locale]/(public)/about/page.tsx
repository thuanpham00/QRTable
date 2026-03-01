import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale);
  const t = await getTranslations("AboutPage");

  return (
    <div className="w-full flex justify-center bg-secondary">
      <div className="w-full max-w-7xl flex flex-col">
        {/* Banner Image */}
        <section className="relative py-0">
          <div className="w-full h-64 md:h-96 overflow-hidden rounded-b-3xl shadow-lg">
            <Image
              src="/images/restaurant_banner.png"
              alt="Banner Nhà hàng"
              width={1200}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
        <section className="py-16 px-4 sm:px-8 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl text-primary mb-4">{t("title")}</h1>
            <p className="mt-2 text-lg md:text-xl text-muted-foreground">{t("address")}</p>
          </div>
        </section>
        <section className="py-10 md:py-16 lg:py-8 px-4 sm:px-8 lg:px-16 xl:px-24">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 mb-4 md:mb-0">
                <Image
                  src="/images/restaurant.png"
                  alt={t("storyTitle")}
                  width={400}
                  height={300}
                  className="rounded-2xl shadow-lg w-full h-64 object-cover"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-primary mb-2">{t("storyTitle")}</h2>
                <p className="mt-2 text-muted-foreground leading-8 text-base md:text-lg">
                  {t("storyContent")}
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2 mb-4 md:mb-0">
                <Image
                  src="/images/chef.png"
                  alt={t("valueTitle")}
                  width={400}
                  height={300}
                  className="rounded-2xl shadow-lg w-full h-64 object-cover"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-primary mb-2">{t("valueTitle")}</h2>
                <p className="mt-2 text-muted-foreground leading-8 text-base md:text-lg">
                  {t("valueContent")}
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 mb-4 md:mb-0">
                <Image
                  src="/images/Dish.png"
                  alt={t("commitmentTitle")}
                  width={400}
                  height={300}
                  className="rounded-2xl shadow-lg w-full h-64 object-cover"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-primary mb-2">{t("commitmentTitle")}</h2>
                <p className="mt-2 text-muted-foreground leading-8 text-base md:text-lg">
                  {t("commitmentContent")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
