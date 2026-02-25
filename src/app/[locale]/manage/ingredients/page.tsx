import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import IngredientTable from "@/app/[locale]/manage/ingredients/ingredient-table";

export default function IngredientsPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle className="text-xl">Nguyên liệu</CardTitle>
            <CardDescription>Quản lý nguyên liệu</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              {/* ngăn lỗi useSearchParams nên dùng Suspense */}
              <IngredientTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
