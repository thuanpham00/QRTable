import { menuApiRequests } from "@/apiRequests/menu";
import PopularDishes from "@/components/popular-dishes";
import SlideImageHero from "@/components/slide-image-hero";
import { Link } from "@/i18n/routing";
import { htmlToTextForDescription } from "@/lib/server-utils";
import { wrapServerApi } from "@/lib/utils";
import { envConfig, Locale } from "@/utils/config";
import { Award, ChefHat, Sparkles, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

export type DishSuggestList = {
  id: number;
  menuId: number;
  dishId: number;
  price: number;
  status: "Available" | "OutOfStock" | "Hidden";
  dish: {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    status: "Active" | "Discontinued";
    categoryId: number;
    category: {
      id: number;
      name: string;
    };
    dietaryTags: string | null;
    spicyLevel: number;
    preparationTime: number;
    searchKeywords: string;
    popularity: number;
    createdAt: Date;
    updatedAt: Date;
    ingredients?: string[] | null | undefined;
  };
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}[];

// dùng api generateMetadata khi cần dịch - còn không cần dịch thì dùng metaData tĩnh
export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale, namespace: "HomePage" });
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}`;

  return {
    title: t("title"),
    description: htmlToTextForDescription(t("description")),
    alternates: {
      canonical: url,
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");
  const resultSuggested = await wrapServerApi(() => menuApiRequests.getMenuSuggested());
  const listDishSuggested = resultSuggested?.payload.data;

  return (
    <div className="w-full space-y-4">
      <div className="relative py-16 bg-linear-to-br from-orange-500/10 via-gray-900/90 to-gray-900 z-[-1]">
        <div className="relative z-5 px-4 sm:px-8 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <p className="text-orange-400 text-base font-semibold mb-4">{t("hello")}</p>
              <h1 className="text-white text-4xl sm:text-4xl lg:text-6xl font-extrabold leading-tight mb-5 drop-shadow-lg">
                {t("title")}
              </h1>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto md:mx-0">{t("description")}</p>
              <Link
                href="/menu"
                className="inline-block px-6 py-4 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-orange-500/40 transition-all duration-300"
              >
                {t("exploreMenu")}
              </Link>
            </div>
            <div className="relative flex justify-center md:justify-end">
              <div className="relative z-4 lg:mr-20">
                <SlideImageHero />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Popular Food Section */}
      <PopularDishes data={listDishSuggested || []} />

      {/* Booking & Location Section */}
      <section className="py-8 px-6 sm:px-8 lg:px-33.75">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="relative">
            <div
              className="absolute inset-0 bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url('/images/restaurant_banner.png')` }}
            />
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm rounded-lg" />
            <div className="relative z-10 p-10 text-center text-white border border-white/20 rounded-lg h-full flex flex-col justify-center">
              <h3 className="text-2xl font-medium mb-6">{t("findUs")}</h3>
              <div className="space-y-2">
                <p>123 HV HCM City</p>
                <p>+0123 456 7890</p>
                <p>phamminhthuan912@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-400 p-10 rounded-lg">
            <h3 className="text-white text-2xl font-medium mb-6 text-center">{t("openingHours")}</h3>
            <div className="space-y-4 text-white text-center">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-lg">{t("mondayToSunday")}</span>
                <span className="mt-1 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-bold text-xl shadow inline-block">
                  8:00 - 22:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-6 sm:px-8 lg:px-33.75">
        <div className="text-center mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
            {t("visitRestaurant")}
          </h2>
          <p className="mt-4 text-black dark:text-white/80 text-lg max-w-2xl mx-auto tracking-wide">
            {t("visitRestaurantDescription")}
          </p>
          <div className="mt-4 h-1 w-32 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="relative group overflow-hidden shadow-lg">
              <Image
                src="/images/restaurant.png"
                alt="Nội thất nhà hàng"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">{t("restaurantSpace")}</span>
              </div>
            </div>
            <div className="relative group overflow-hidden shadow-lg">
              <Image
                src="/images/restaurant_banner.png"
                alt="Nội thất nhà hàng"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">{t("lobby")}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div className="relative group overflow-hidden shadow-lg h-71.25 lg:h-146.5">
              <Image
                src="/images/house.png"
                alt="Nội thất nhà hàng"
                width={250}
                height={300}
                className="w-full h-full lg:h-146.5 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">{t("mainDiningRoom")}</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="relative group overflow-hidden shadow-lg">
              <Image
                src="/images/Dish.png"
                alt="Món ăn"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">{t("featuredDish")}</span>
              </div>
            </div>
            <div className="relative group overflow-hidden shadow-lg">
              <Image
                src="/images/chef.png"
                alt="Đầu bếp"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">{t("professionalChef")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="relative overflow-hidden pt-12 pb-16">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
        </div>

        <div className="relative z-10 px-6 sm:px-8 lg:px-33.75">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent mb-3">
              {t("whyChooseUs")}
            </h2>
            <div className="mt-4 h-1 w-32 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                Icon: Sparkles,
                title: t("greatTaste"),
                description: t("featuredDish"),
                color: "text-yellow-400",
                bgColor: "bg-yellow-500/20",
                borderColor: "border-yellow-400/30",
                shadowColor: "shadow-yellow-500/20",
              },
              {
                Icon: Users,
                title: t("selfService"),
                description: t("fastConvenient"),
                color: "text-blue-400",
                bgColor: "bg-blue-500/20",
                borderColor: "border-blue-400/30",
                shadowColor: "shadow-blue-500/20",
              },
              {
                Icon: Award,
                title: t("bestDish"),
                description: t("topQuality"),
                color: "text-green-400",
                bgColor: "bg-green-500/20",
                borderColor: "border-green-400/30",
                shadowColor: "shadow-green-500/20",
              },
              {
                Icon: ChefHat,
                title: t("professionalChef"),
                description: t("experiencedChef"),
                color: "text-red-400",
                bgColor: "bg-red-500/20",
                borderColor: "border-red-400/30",
                shadowColor: "shadow-red-500/20",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group flex flex-col items-center cursor-pointer transition-all duration-500 hover:scale-105"
              >
                {/* Icon Container */}
                <div
                  className={`relative w-24 h-24 md:w-28 md:h-28 mb-5 rounded-2xl ${feature.bgColor} backdrop-blur-md flex items-center justify-center shadow-2xl ${feature.shadowColor} group-hover:shadow-3xl transition-all duration-500 border-2 ${feature.borderColor} overflow-hidden`}
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Rotating border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 animate-spin-slow bg-linear-to-r from-white/40 via-transparent to-transparent rounded-2xl" />
                  </div>

                  {/* Icon */}
                  <feature.Icon
                    className={`relative z-10 w-12 h-12 md:w-14 md:h-14 ${feature.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-lg`}
                    strokeWidth={2.5}
                  />

                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                </div>

                {/* Text Content */}
                <div className="text-center">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-black/60 dark:text-white mb-1 transition-colors duration-300 drop-shadow-md">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
