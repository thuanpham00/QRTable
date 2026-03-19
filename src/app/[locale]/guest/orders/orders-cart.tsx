/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useGuestOrderQuery } from "@/queries/useGuest";
import Image from "next/image";
import { OrderModeType, OrderStatus } from "@/constants/type";
import { useEffect } from "react";
import {
  CreateOrdersResType,
  PayGuestOrdersResType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import { toast } from "sonner";
import { formatCurrency, getVietnameseOrderStatus } from "../../../../lib/utils";
import { useAppStore } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";

const orderStatusMap = (t: any) => ({
  [OrderStatus.Pending]: {
    label: t("Pending"),
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  [OrderStatus.Processing]: {
    label: t("Processing"),
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  [OrderStatus.Rejected]: {
    label: t("Rejected"),
    className: "bg-red-100 text-red-800 border-red-300",
  },
  [OrderStatus.Delivered]: {
    label: t("Delivered"),
    className: "bg-green-100 text-green-800 border-green-300",
  },
  [OrderStatus.Paid]: {
    label: t("Paid"),
    className: "bg-gray-100 text-gray-800 border-gray-300",
  },
});

export default function OrdersCart() {
  const t = useTranslations("GuestOrderPage");
  const queryClient = useQueryClient();

  const infoGuest = useAppStore((state) => state.infoGuest);
  const socket = useAppStore((state) => state.socket);
  const { data, refetch } = useGuestOrderQuery();
  const listOrder = data?.payload.data || [];

  const totalPrice = listOrder.reduce(
    (acc, order) => {
      if (order.status === OrderStatus.Paid) {
        return {
          ...acc,
          payed: {
            price: acc.payed.price + order.dishSnapshot.price * order.quantity,
            quantity: acc.payed.quantity + order.quantity,
          },
        };
      }
      if (
        order.status === OrderStatus.Delivered ||
        order.status === OrderStatus.Processing ||
        order.status === OrderStatus.Pending
      ) {
        return {
          ...acc,
          waitingForPaying: {
            price: acc.waitingForPaying.price + order.dishSnapshot.price * order.quantity,
            quantity: acc.waitingForPaying.quantity + order.quantity,
          },
        };
      }
      return acc;
    },
    {
      waitingForPaying: {
        quantity: 0,
        price: 0,
      },
      payed: {
        quantity: 0,
        price: 0,
      },
    },
  );

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

    function onUpdateOrder(data: UpdateOrderResType["data"]) {
      const {
        dishSnapshot: { name },
        quantity,
        status,
      } = data;

      toast.success(
        `Món ${name} (SL: ${quantity}) vừa được cập nhật sang trạng thái ${getVietnameseOrderStatus(status)}`,
        { duration: 4000 },
      );
      refetch();
    }

    function onPayment(data: PayGuestOrdersResType["data"]) {
      toast.success(`Bạn đã thanh toán thành công ${data.length} đơn`, {
        duration: 4000,
      });
      refetch();
    }

    function onNewOrder(data: CreateOrdersResType["data"]) {
      toast.success(`Khách hàng ${data[0].guest?.name} (bàn ${data[0].tableNumber}) vừa tạo đơn hàng mới`, {
        duration: 4000,
      });
      refetch();
    }

    function onPaymentCompleted() {
      toast.success(`Bạn đã thanh toán thành công`, {
        duration: 4000,
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["payments-for-guest"] });
    }

    socket?.on("update-order", onUpdateOrder);
    socket?.on("payment", onPayment);

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("new-order", onNewOrder);
    socket?.on("payment-completed", onPaymentCompleted);
    socket?.on("payment-group-completed", onPaymentCompleted);

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("update-order", onUpdateOrder);
      socket?.off("payment", onPayment);
      socket?.off("new-order", onNewOrder);
      socket?.off("payment-completed", onPaymentCompleted);
      socket?.off("payment-group-completed", onPaymentCompleted);
    };
  }, [refetch, socket, queryClient]);

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2 items-center">
        <h1 className="text-center text-xl font-bold">{t("orders")} - </h1>
        <Badge variant="default">
          {infoGuest?.tableTypeQR === OrderModeType.DINE_IN
            ? `${t("table")} ${infoGuest.tableNumber}`
            : t("TakeAway")}
        </Badge>
      </div>
      <div className="flex flex-col h-[calc(100vh-330px)] overflow-y-auto gap-4 py-2">
        {listOrder.length === 0 ? (
          <div className="text-center text-gray-500 py-8">{t("no-order")}</div>
        ) : (
          listOrder.map((order) => (
            <div
              key={order.id}
              className="flex gap-4 bg-background dark:bg-card p-3 rounded-lg shadow-sm border"
            >
              <div className="shrink-0 relative">
                <Image
                  src={order.dishSnapshot.image}
                  alt={order.dishSnapshot.name}
                  height={100}
                  width={100}
                  quality={100}
                  unoptimized
                  className="object-cover w-36 h-36 rounded-md"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-[15px] font-semibold">{order.dishSnapshot.name}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md border ${
                      orderStatusMap(t)[order.status].className
                    }`}
                  >
                    {orderStatusMap(t)[order.status].label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">{t("typeOrder")}:</span>
                  <span className="text-sm font-semibold">
                    {order.orderMode === OrderModeType.DINE_IN ? t("DineIn") : t("TakeAway")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{t("quantity")}:</span>
                    <span className="text-sm font-semibold">{order.quantity}</span>
                  </div>
                  <div className="text-sm font-bold text-white bg-linear-to-r from-orange-500 to-amber-500 px-3 py-1 rounded-lg shadow-lg">
                    {formatCurrency(order.dishSnapshot.price * order.quantity)}
                  </div>
                </div>

                <div>
                  <span className="text-xs mb-2 block">{t("note")}:</span>
                  <Textarea className="text-xs" value={order.note || "-"} disabled />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {listOrder.length > 0 && (
        <div className="sticky bottom-0 border-t-2 pt-3 space-y-3">
          <div className="flex justify-between items-center px-4 py-3 bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-lg border-2 border-orange-300 dark:border-orange-700 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-base font-semibold text-orange-900 dark:text-orange-100">
                {t("unpaid-order")} ({totalPrice.waitingForPaying.quantity})
              </span>
            </div>
            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(totalPrice.waitingForPaying.price)}
            </span>
          </div>

          {totalPrice.payed.price !== 0 && (
            <div className="flex justify-between items-center px-4 py-3 bg-linear-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm opacity-75">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("paid-order")} ({totalPrice.payed.quantity})
                </span>
              </div>
              <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                {formatCurrency(totalPrice.payed.price)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
