import OrderStatics from "@/app/[locale]/manage/orders/order-statics";
import { ServingGuestByTableNumber, Statics } from "@/app/[locale]/manage/orders/order-table-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableListResType } from "@/schemaValidations/table.schema";
import { TableSessionActiveListResType } from "@/schemaValidations/tableSessions.schema";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("ManageOrders");
  return (
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader>
        <CardTitle className="text-xl">{t("tableSessionCurrent")}</CardTitle>
        <CardDescription>{t("tableSessionCurrentDescription")}</CardDescription>
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
