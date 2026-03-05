/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { GetOrdersResType } from "@/schemaValidations/order.schema";
import { useEffect, useState } from "react";
import { OrderModeType, OrderStatus, OrderStatusType, OrderStatusValues } from "@/constants/type";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderList from "@/app/[locale]/manage/orders/order-list";
import TableSessionList from "@/app/[locale]/manage/orders/table-session-list";
import { useGetOrderQuery } from "@/queries/useOrder";
import { endOfDay, startOfDay } from "date-fns";
import { useGetListTableQuery } from "@/queries/useTable";
import { TableListResType } from "@/schemaValidations/table.schema";
import { useOrderService } from "@/app/[locale]/manage/orders/order.service";
import { useGetListActiveTableSessionQuery } from "@/queries/useTableSession";
import { TableSessionActiveListResType } from "@/schemaValidations/tableSessions.schema";
import { useAppStore } from "@/components/app-provider";
import { useTranslations } from "next-intl";

export type StatusCountObject = Record<(typeof OrderStatusValues)[number], number>;
export type Statics = {
  status: StatusCountObject;
  table: Record<number, Record<number, StatusCountObject>>;
};
export type OrderObjectByGuestID = Record<number, GetOrdersResType["data"]>;
export type ServingGuestByTableNumber = Record<number, OrderObjectByGuestID>;

function checkStatus(status: OrderStatusType) {
  const arr = [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered];
  return arr.includes(status as any);
}

const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());
export default function OrderTableSession() {
  const t = useTranslations("ManageOrders");
  const socket = useAppStore((state) => state.socket);

  const [selectedTabPage, setSelectedTabPage] = useState<string>("orders");
  const [fromDate, setFromDate] = useState(initFromDate);
  const [toDate, setToDate] = useState(initToDate);

  const tableListQuery = useGetListTableQuery({
    pagination: "false",
    page: 1,
    limit: 5, // nếu pagination = false thì page và limit không có ý nghĩa
  });
  const tableList: TableListResType["data"] = tableListQuery.data?.payload.data ?? [];

  const { data, refetch, isPending } = useGetOrderQuery({
    fromDate: fromDate,
    toDate: toDate,
  }); // fetch order list ngày hôm nay (mặc định)
  const orderList: GetOrdersResType["data"] = data?.payload.data ?? [];

  const getListActiveTableSessionQuery = useGetListActiveTableSessionQuery(); // trả về danh sách phiên bàn hiện tại đang hoạt động (chưa kết thúc)

  const tableListSortedByNumber = tableList.sort((a, b) => a.number - b.number);

  const { statics, servingGuestByTableNumber } = useOrderService(orderList);

  // const countTotalTableSession = Object.keys(servingGuestByTableNumber).length;
  const countOrderDineInByTab = orderList.filter(
    (order) => order.orderMode === OrderModeType.DINE_IN && checkStatus(order.status),
  ).length;
  const countOrderTakeOutByTab = orderList.filter(
    (order) => order.orderMode === OrderModeType.TAKE_OUT && checkStatus(order.status),
  ).length;
  const countTotalOrder = countOrderDineInByTab + countOrderTakeOutByTab;

  const countTotalTableSession = getListActiveTableSessionQuery.data?.payload.data?.length ?? 0;
  const dataListTableSessionActive =
    getListActiveTableSessionQuery.data?.payload.data ?? ([] as TableSessionActiveListResType["data"]);

  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }

    function onConnect() {
      console.log(socket?.id);
    }

    function onDisconnect() {
      console.log("disconnected");
    }

    // làm mới 2 query listOrder và TableSessionList
    function refetchListOrderAndTableSession() {
      getListActiveTableSessionQuery.refetch();
      refetch();
    }

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("refetch-list-order-and-table-session", refetchListOrderAndTableSession);

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("refetch-list-order-and-table-session", refetchListOrderAndTableSession);
    };
  }, [refetch, getListActiveTableSessionQuery, socket]);

  return (
    <div>
      <Tabs value={selectedTabPage} onValueChange={(val) => setSelectedTabPage(val)} className="mb-4">
        <TabsList variant="default">
          <TabsTrigger value={"orders"}>
            <span>{t("ordersTab")}</span>
            <span className="bg-red-500 w-4 h-4 text-center inline-block rounded-full text-xs">
              {countTotalOrder}
            </span>
          </TabsTrigger>
          <TabsTrigger value={"table-sessions"}>
            <span>{t("tableSessionsTab")}</span>
            <span className="bg-red-500 w-4 h-4 text-center inline-block rounded-full text-xs">
              {countTotalTableSession}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {selectedTabPage === "orders" && (
        <div className="mt-4">
          <OrderList
            orderList={orderList}
            refetch={refetch}
            isPending={isPending}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            statics={statics}
            countOrderDineInByTab={countOrderDineInByTab}
            countOrderTakeOutByTab={countOrderTakeOutByTab}
          />
        </div>
      )}

      {selectedTabPage === "table-sessions" && (
        <div className="mt-4">
          <TableSessionList
            statics={statics}
            tableListSortedByNumber={tableListSortedByNumber}
            servingGuestByTableNumber={servingGuestByTableNumber}
            dataListTableSessionActive={dataListTableSessionActive}
          />
        </div>
      )}
    </div>
  );
}
