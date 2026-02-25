import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import MenuTable from "@/app/[locale]/manage/menus/menu-table";

export default function MenusPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle className="text-xl">Menu</CardTitle>
            <CardDescription>Quản lý menu</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              {/* ngăn lỗi useSearchParams nên dùng Suspense */}
              <MenuTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
