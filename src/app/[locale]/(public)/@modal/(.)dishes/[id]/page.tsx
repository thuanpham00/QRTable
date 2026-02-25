import { menuApiRequests } from "@/apiRequests/menu";
import { wrapServerApi } from "@/lib/utils";
import ModalDishIntercepting from "@/app/[locale]/(public)/@modal/(.)dishes/[id]/modal";
import DishDetail from "@/app/[locale]/(public)/dishes/[id]/dish-detail";

type Params = Promise<{ id: string }>;

export default async function DishesPage({ params }: { params: Params }) {
  const { id } = await params;
  const result = await wrapServerApi(() => menuApiRequests.menuItem(Number(id)));
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
