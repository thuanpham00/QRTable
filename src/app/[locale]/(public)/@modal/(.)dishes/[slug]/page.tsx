import { menuApiRequests } from "@/apiRequests/menu";
import { generateSlugUrl, getIdFromSlugUrl, wrapServerApi } from "@/lib/utils";
import ModalDishIntercepting from "@/app/[locale]/(public)/@modal/(.)dishes/[slug]/modal";
import DishDetail from "@/app/[locale]/(public)/dishes/[slug]/dish-detail";

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
