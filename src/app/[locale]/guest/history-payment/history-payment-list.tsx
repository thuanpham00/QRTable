"use client";
import { useGuestPaymentQuery } from "@/queries/useGuest";
import { GuestGetPaymentsResType } from "@/schemaValidations/guest.schema";
import { useTranslations } from "next-intl";

export default function HistoryPaymentList() {
  const t = useTranslations("GuestHistoryPayment");
  const { data } = useGuestPaymentQuery();
  const payments = (data?.payload.data || []) as GuestGetPaymentsResType["data"];

  return (
    <div className="space-y-4 max-w-150 mx-auto">
      <div className="flex justify-center gap-2 items-center">
        <h1 className="text-center text-xl font-bold">{t("title")}</h1>
      </div>
      {payments.length === 0 ? (
        <div className="text-center text-muted-foreground">{t("noPayment")}</div>
      ) : (
        payments.map((payment) => (
          <div
            key={payment.id}
            className="rounded-lg border shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-card"
          >
            <div className="flex-1 space-y-2">
              <div className="font-semibold text-lg flex items-center gap-2">
                <div className="text-black dark:text-white"> {t("totalAmount")}: </div>
                <div className="text-orange-600">{payment.totalAmount.toLocaleString()}₫</div>
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
            <div className="flex flex-col items-end">
              <div className="font-medium">
                {t("guest")}: {payment.guest.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("table")}: {payment.guest.tableNumber ?? "-"}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
