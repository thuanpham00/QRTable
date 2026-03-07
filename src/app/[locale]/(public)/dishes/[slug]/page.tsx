import { menuApiRequests } from "@/apiRequests/menu";
import { generateSlugUrl, getIdFromSlugUrl, wrapServerApi } from "@/lib/utils";
import DishDetail from "@/app/[locale]/(public)/dishes/[slug]/dish-detail";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { envConfig, Locale } from "@/utils/config";
import { baseOpenGraph } from "@/shared-metadata";
import { htmlToTextForDescription } from "@/lib/server-utils";

type Props = {
  params: Promise<{ slug: string; locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "DishDetail",
  });
  const id = getIdFromSlugUrl(params.slug);
  const data = await menuApiRequests.menuItem(id);
  const dish = data?.payload.data;
  if (!dish) {
    return {
      title: t("notFound"),
      description: t("notFound"),
    };
  }
  const url =
    envConfig.NEXT_PUBLIC_URL +
    `/${params.locale}/dishes/${generateSlugUrl({
      name: dish.dish.name,
      id: dish.id,
    })}`;

  return {
    title: dish.dish.name,
    description: htmlToTextForDescription(dish.dish.description),
    openGraph: {
      ...baseOpenGraph,
      title: dish.dish.name,
      description: dish.dish.description,
      url,
      images: [
        {
          url: dish.dish.image,
        },
      ],
    },
    alternates: {
      canonical: url,
    },
  };
}

// slug: pho-tai-i-111

export async function generateStaticParams() {
  const data = await wrapServerApi(() => menuApiRequests.menuActive());
  const list = data?.payload.data.menuItems ?? [];
  return list?.map((item) => ({
    slug: generateSlugUrl({
      name: item.dish.name,
      id: item.id,
    }),
  }));
} // biến page /dishes/[slug] thành 1 page động với các slug thành page static vì các slug đã biết trước thông qua hàm generateStaticParams, hàm này sẽ lấy tất cả menu item đang hoạt động rồi tạo ra 1 mảng các slug tương ứng với id và tên món ăn, từ đó nextjs sẽ tự động tạo ra các page static cho từng slug dựa trên template page.tsx này

export default async function DishesPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const id = getIdFromSlugUrl(slug);
  const result = await wrapServerApi(() => menuApiRequests.menuItem(id));
  const menuItem = result?.payload.data;

  if (!menuItem) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-muted-foreground">Món ăn không tồn tại</h1>
      </div>
    );
  }

  return <DishDetail dish={menuItem} />;
}
