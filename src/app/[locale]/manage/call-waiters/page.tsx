import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import CallWaitersTable from "@/app/[locale]/manage/call-waiters/call-waiters-table";

export default function CallWaitersPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle className="text-xl">Gọi phục vụ</CardTitle>
            <CardDescription>Yêu cầu gọi phục vụ từ khách</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <CallWaitersTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
