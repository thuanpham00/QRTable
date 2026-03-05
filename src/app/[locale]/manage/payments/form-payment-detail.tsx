"use client";

import { useGetDetailPayment } from "@/queries/usePayment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateTimeToLocaleString } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FormPaymentDetail({
  id,
  setId,
}: {
  id: number | undefined;
  setId: (value: number | undefined) => void;
}) {
  const payment = useGetDetailPayment({ id: id as number, enabled: Boolean(id) });
  const dataPaymentDetail = payment.data?.payload.data;
  const t = useTranslations("ManagePayments");

  if (!id) return null;

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={() => {
        setId(undefined);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("paymentDetailTitle", { id })}</DialogTitle>
        </DialogHeader>

        {payment.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : payment.isError ? (
          <div className="text-center py-8 text-destructive">{t("loadingError")}</div>
        ) : dataPaymentDetail ? (
          <div className="space-y-6 py-4">
            {/* Thông tin chính */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("statusLabel")}</span>
                <Badge
                  variant={dataPaymentDetail.status === "Paid" ? "default" : "secondary"}
                  className={
                    dataPaymentDetail.status === "Paid"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                  }
                >
                  {dataPaymentDetail.status === "Paid" ? t("paid") : t("pendingPay")}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("methodLabel")}</span>
                <span className="font-semibold">
                  {dataPaymentDetail.paymentMethod === "CASH" ? t("cash") : t("transfer")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("totalAmountLabel")}</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(dataPaymentDetail.totalAmount)}
                </span>
              </div>
            </div>

            <Separator />

            {/* Thông tin khách hàng & bàn */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">{t("orderInfoTitle")}</h3>

              {dataPaymentDetail.guest && (
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                  <span className="text-sm text-muted-foreground">{t("customer")}</span>
                  <span className="font-medium">
                    {dataPaymentDetail.guest.name}{" "}
                    <span className="text-xs text-muted-foreground">#{dataPaymentDetail.guestId}</span>
                  </span>
                </div>
              )}

              {dataPaymentDetail.table && (
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                  <span className="text-sm text-muted-foreground">{t("tableNo")}</span>
                  <span className="font-bold text-lg">{dataPaymentDetail.table.number}</span>
                </div>
              )}

              {dataPaymentDetail.orders && dataPaymentDetail.orders.length > 0 && (
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                  <span className="text-sm text-muted-foreground">{t("orderQuantity")}</span>
                  <span className="font-medium">
                    {t("orderCount", { count: dataPaymentDetail.orders.length })}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Thông tin giao dịch SeePay */}
            {dataPaymentDetail.paymentMethod === "SEPAY" && dataPaymentDetail.sepayTransactionId && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">{t("transactionInfoTitle")}</h3>

                  <div className="space-y-2 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono text-sm font-medium">
                        {dataPaymentDetail.sepayTransactionId}
                      </span>
                    </div>

                    {dataPaymentDetail.sepayReferenceCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t("referenceCode")}</span>
                        <span className="font-mono text-sm font-medium">
                          {dataPaymentDetail.sepayReferenceCode}
                        </span>
                      </div>
                    )}

                    {dataPaymentDetail.sepayGateway && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t("bank")}</span>
                        <span className="font-semibold text-sm">{dataPaymentDetail.sepayGateway}</span>
                      </div>
                    )}

                    {dataPaymentDetail.sepayTransactionDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t("transactionTime")}</span>
                        <span className="text-sm">
                          {formatDateTimeToLocaleString(dataPaymentDetail.sepayTransactionDate)}
                        </span>
                      </div>
                    )}

                    {dataPaymentDetail.sepayContent && (
                      <div className="pt-2 border-t">
                        <span className="text-xs text-muted-foreground block mb-1">
                          {t("transferContent")}
                        </span>
                        <span className="text-xs font-mono bg-white dark:bg-gray-900 p-2 rounded block">
                          {dataPaymentDetail.sepayContent}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Thông tin hệ thống */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">{t("systemInfoTitle")}</h3>

              {dataPaymentDetail.createdBy && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t("createdByLabel")}</span>
                  <span className="text-sm font-medium">{dataPaymentDetail.createdBy.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t("createdAtLabel")}</span>
                <span className="text-sm">{formatDateTimeToLocaleString(dataPaymentDetail.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t("lastUpdated")}</span>
                <span className="text-sm">{formatDateTimeToLocaleString(dataPaymentDetail.updatedAt)}</span>
              </div>

              {dataPaymentDetail.note && (
                <div className="pt-2">
                  <span className="text-xs text-muted-foreground block mb-1">{t("noteLabel")}</span>
                  <span className="text-sm bg-muted/50 p-2 rounded block">{dataPaymentDetail.note}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
