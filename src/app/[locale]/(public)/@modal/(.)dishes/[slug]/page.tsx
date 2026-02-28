import { menuApiRequests } from "@/apiRequests/menu";
import { getIdFromSlugUrl, wrapServerApi } from "@/lib/utils";
import ModalDishIntercepting from "@/app/[locale]/(public)/@modal/(.)dishes/[slug]/modal";
import DishDetail from "@/app/[locale]/(public)/dishes/[slug]/dish-detail";

// slug: pho-tai-i-111

export default async function DishesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  return (
    <ModalDishIntercepting>
      <DishDetail dish={menuItem} />
    </ModalDishIntercepting>
  );
}
