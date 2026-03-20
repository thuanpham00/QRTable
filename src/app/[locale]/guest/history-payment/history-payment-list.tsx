"use client";
import { useGuestPaymentQuery } from "@/queries/useGuest";
import { GuestGetPaymentsResType } from "@/schemaValidations/guest.schema";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

export default function HistoryPaymentList() {
  const t = useTranslations("GuestHistoryPayment");
  const { data } = useGuestPaymentQuery();
  const payments = (data?.payload.data || []) as GuestGetPaymentsResType["data"];
  const [expandedPaymentId, setExpandedPaymentId] = useState<number | null>(null);

  return (
    <div className="space-y-4 max-w-150 mx-auto">
      <div className="flex justify-center gap-2 items-center">
        <h1 className="text-center text-xl font-bold">{t("title")}</h1>
      </div>
      {payments.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">{t("noPayment")}</div>
      ) : (
        payments.map((payment) => (
          <div key={payment.id} className="bg-background dark:bg-card rounded-lg border shadow-sm p-4">
            <div className="flex flex-col items-start sm:flex-row sm:items-start gap-1 sm:gap-4">
              <div className="w-[70%] space-y-2">
                <div className="font-semibold text-lg flex items-center gap-2">
                  <div className="text-black dark:text-white"> {t("totalAmount")}: </div>
                  <div className="text-orange-600">{payment.totalAmount.toLocaleString()}₫</div>
                </div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  <div className="text-muted-foreground"> Bill: </div>
                  <div className="text-black dark:text-white">#{payment.id}</div>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <div className="text-muted-foreground">{t("paymentMethod")}:</div>
                  <div className="text-black dark:text-white">{t(payment.paymentMethod)}</div>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <div className="text-muted-foreground">{t("status")}:</div>
                  <div className="text-black dark:text-white">{t(payment.status)}</div>
                </div>
                <div className="text-xs flex items-center gap-2">
                  <div className="text-muted-foreground">{t("createdAt")}:</div>
                  <div className="text-black dark:text-white">
                    {new Date(payment.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="grow flex flex-col items-start sm:items-end gap-2">
                <div className="font-medium text-left sm:text-right">
                  {t("guest")}: {payment.guest.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("table")}: {payment.guest.tableNumber ?? "-"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setExpandedPaymentId(expandedPaymentId === payment.id ? null : payment.id)}
              className="mt-3 text-sm underline hover:text-blue-500 duration-75"
            >
              {expandedPaymentId === payment.id ? t("hiddenDetails") : t("viewDetails")}
            </button>
            {expandedPaymentId === payment.id && (
              <div className="mt-4 space-y-2">
                <div className="font-semibold">{t("orders")}</div>
                {payment.orders.map((order) => (
                  <div key={order.id} className="flex items-center gap-3 border-b py-2 last:border-b-0">
                    <Image
                      width={50}
                      height={50}
                      src={order.dishSnapshot.image}
                      alt={order.dishSnapshot.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{order.dishSnapshot.name}</div>
                      <div className="text-xs text-muted-foreground">{order.dishSnapshot.description}</div>
                    </div>
                    <div className="font-semibold text-orange-600">
                      {order.dishSnapshot.price.toLocaleString()}₫
                    </div>
                    <div className="text-sm">x{order.quantity}</div>
                  </div>
                ))}
                <div className="mt-2 font-bold text-right text-orange-600">
                  {t("amountBill")} {payment.totalAmount.toLocaleString()}₫
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
