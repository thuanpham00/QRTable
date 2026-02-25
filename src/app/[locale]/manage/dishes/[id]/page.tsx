import DishDetail from "@/app/[locale]/manage/dishes/[id]/dish-detail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

type Params = Promise<{ id: string }>;

export default async function DishDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle className="text-xl">Chi tiết món ăn {id}</CardTitle>
            <CardDescription>Quản lý danh sách món ăn</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <DishDetail />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
