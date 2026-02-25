import OrderStatics from "@/app/[locale]/manage/orders/order-statics";
import { ServingGuestByTableNumber, Statics } from "@/app/[locale]/manage/orders/order-table-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableListResType } from "@/schemaValidations/table.schema";
import { TableSessionActiveListResType } from "@/schemaValidations/tableSessions.schema";

export default function TableSessionList({
  tableListSortedByNumber,
  servingGuestByTableNumber,
  statics,
  dataListTableSessionActive,
}: {
  tableListSortedByNumber: TableListResType["data"];
  servingGuestByTableNumber: ServingGuestByTableNumber;
  statics: Statics;
  dataListTableSessionActive: TableSessionActiveListResType["data"];
}) {
  return (
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader>
        <CardTitle className="text-xl">Phiên bàn hiện tại</CardTitle>
        <CardDescription>Quản lý phiên bàn</CardDescription>
      </CardHeader>
      <CardContent>
        <OrderStatics
          statics={statics}
          tableList={tableListSortedByNumber}
          servingGuestByTableNumber={servingGuestByTableNumber}
          dataListTableSessionActive={dataListTableSessionActive}
        />
      </CardContent>
    </Card>
  );
}
