import { OrderByTableContext } from "@/app/[locale]/manage/orders/tables/[id]/page";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useGetDetailTableSessionHistoryQuery } from "@/queries/useTableSession";
import { formatCurrency, formatDateTimeToLocaleString, getVietnameseOrderStatus } from "@/lib/utils";
import { OrderStatus } from "@/constants/type";
import { useContext } from "react";
import { intervalToDuration } from "date-fns";
import { Users, UtensilsCrossed, DollarSign, Clock, User, ShoppingBag, CreditCard } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Helper function để format trạng thái phiên bàn
const getSessionStatusBadge = (status: string, t: (key: string) => string) => {
  switch (status) {
    case "Completed":
      return <Badge className="bg-blue-500 text-white">{t("statusCompleted")}</Badge>;
    case "Cancelled":
      return <Badge variant="destructive">{t("statusCancelled")}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper function để format thời lượng
const formatSessionDuration = (startTime: Date, endTime: Date | null, t: (key: string) => string) => {
  if (!endTime) return t("serving");

  const duration = intervalToDuration({
    start: startTime,
    end: endTime,
  });

  const parts: string[] = [];
  if (duration.hours) parts.push(`${duration.hours}${t("hourUnit")}`);
  if (duration.minutes) parts.push(`${duration.minutes}${t("minuteUnit")}`);

  return parts.length > 0 ? parts.join(" ") : t("lessThanOneMin");
};

// Helper function để format payment method
const getPaymentMethodBadge = (method: string, t: (key: string) => string) => {
  switch (method) {
    case "CASH":
      return (
        <Badge variant="outline" className="bg-green-50 text-black">
          💵 {t("paymentCash")}
        </Badge>
      );
    case "SEPAY":
      return (
        <Badge variant="outline" className="bg-blue-50 text-black">
          🏦 {t("paymentTransfer")}
        </Badge>
      );
    default:
      return <Badge variant="outline">{method}</Badge>;
  }
};

// Helper function để format payment status
const getPaymentStatusBadge = (status: string, t: (key: string) => string) => {

  switch (status) {
    case "Paid":
      return <Badge className="bg-green-500 text-white">{t("paymentSuccess")}</Badge>;
    case "Pending":
      return <Badge className="bg-yellow-500 text-white">{t("paymentPending")}</Badge>;
    case "Cancelled":
      return (
        <Badge variant="destructive" className="text-white bg-red-500">
          {t("paymentFailed")}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-white bg-red-500!">
          {status}
        </Badge>
      );
  }
};

export default function TableSessionDetailDialog() {
  const t = useTranslations("ManageOrders");
  const { tableSessionId, setTableSessionId } = useContext(OrderByTableContext);
  const detailTableSessionHistory = useGetDetailTableSessionHistoryQuery({
    idTableSession: tableSessionId!,
    enable: Boolean(tableSessionId),
  });

  const data = detailTableSessionHistory.data?.payload.data;

  if (!data) {
    return (
      <Dialog
        open={tableSessionId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTableSessionId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t("sessionDetailLoading")}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={tableSessionId !== null}
      onOpenChange={(open) => {
        if (!open) {
          setTableSessionId(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{t("sessionDetailTitle", { id: data.id })}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("tableNoLabel", { number: data.tableNumber })}
              </p>
            </div>
            {getSessionStatusBadge(data.status, t as (key: string) => string)}
          </div>
        </DialogHeader>

        <div className="flex gap-4">
          <div className="w-[40%]">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {t("timeCardTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      {t("startLabel")} {formatDateTimeToLocaleString(data.startTime)}
                    </div>
                    <div>
                      {data.endTime
                        ? `${t("endLabel")} ${formatDateTimeToLocaleString(data.endTime)}`
                        : t("serving")}
                    </div>
                    <Separator className="my-1" />
                    <div className="font-semibold text-primary">
                      {t("durationLabel")}{" "}
                      {formatSessionDuration(data.startTime, data.endTime, t as (key: string) => string)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    {t("guestsCardTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data.guestCount}</div>
                  <p className="text-xs text-muted-foreground">{t("guestUnit")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                    {t("dishesCardTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data.orderCount}</div>
                  <p className="text-xs text-muted-foreground">{t("dishUnit")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-500" />
                    {t("revenueCardTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(data.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">{t("totalIncomeLabel")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="w-[60%]">
            {data.note && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm">
                  <span className="font-semibold text-black">{t("noteLabel")}</span>
                  <span className="ml-2 text-black">{data.note}</span>
                </div>
              </div>
            )}

            {/* Tabs for detailed information */}
            <Tabs defaultValue="orders" className="flex-1 overflow-hidden max-h-100 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {t("dishesCardTitle")} ({data.orders.length})
                </TabsTrigger>
                <TabsTrigger value="guests" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t("guestsTab")} ({data.guests.length})
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t("paymentsTab")} ({data.paymentGroups.length + data.individualPayments.length})
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders" className="flex-1 overflow-auto mt-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-15">{t("sttHeader")}</TableHead>
                        <TableHead className="w-20">{t("imageHeader")}</TableHead>
                        <TableHead>{t("dishNameColumnHeader")}</TableHead>
                        <TableHead className="text-center">{t("quantityShort")}</TableHead>
                        <TableHead className="text-right">{t("unitPriceHeader")}</TableHead>
                        <TableHead className="text-right">{t("totalPriceHeader")}</TableHead>
                        <TableHead className="text-center">{t("statusHeader")}</TableHead>
                        <TableHead>{t("guestHeader")}</TableHead>
                        <TableHead>{t("createdAtHeader")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            {t("noOrders")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.orders.map((order, index) => (
                          <TableRow key={order.id}>
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell>
                              <Image
                                src={order.dishSnapshot.image}
                                alt={order.dishSnapshot.name}
                                width={50}
                                height={50}
                                className="rounded object-cover"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{order.dishSnapshot.name}</TableCell>
                            <TableCell className="text-center">{order.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(order.dishSnapshot.price)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(order.dishSnapshot.price * order.quantity)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">
                                {getVietnameseOrderStatus(
                                  order.status as (typeof OrderStatus)[keyof typeof OrderStatus],
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {t("guestIdLabel", { id: order.guestId as number })}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDateTimeToLocaleString(order.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Guests Tab */}
              <TabsContent value="guests" className="flex-1 overflow-auto mt-4">
                <div className="grid gap-4">
                  {data.guests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">{t("noGuests")}</div>
                  ) : (
                    data.guests.map((guest, index) => (
                      <Card key={guest.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <User className="w-5 h-5" />
                              {t("guestNoLabel", { index: index + 1, name: guest.name })}
                            </span>
                            <Badge variant="outline">ID: {guest.id}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t("checkInTime")}</span>
                              <div className="font-medium">
                                {formatDateTimeToLocaleString(guest.createdAt)}
                              </div>
                            </div>
                            {guest.dietaryPreferences && (
                              <div>
                                <span className="text-muted-foreground">{t("dietaryPrefs")}</span>
                                <div className="font-medium">{guest.dietaryPreferences}</div>
                              </div>
                            )}
                            {guest.allergyInfo && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">{t("allergyLabel")}</span>
                                <div className="font-medium text-red-600">{guest.allergyInfo}</div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="flex-1 overflow-auto mt-4">
                <div className="space-y-6">
                  {data.paymentGroups.length === 0 && data.individualPayments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">{t("noPayments")}</div>
                  ) : (
                    <>
                      {/* Payment Groups Section */}
                      {data.paymentGroups.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <span>{t("groupPaymentsTitle", { count: data.paymentGroups.length })}</span>
                          </div>

                          {data.paymentGroups.map((paymentGroup) => (
                            <Card key={paymentGroup.id} className="border-2 border-blue-200 bg-blue-50/30">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                      G{paymentGroup.id}
                                    </div>
                                    <div>
                                      <div className="text-lg">
                                        {t("paymentGroupTitle", { id: paymentGroup.id })}
                                      </div>
                                      <div className="text-sm font-normal text-muted-foreground">
                                        {t("paymentsCountTotal", { count: paymentGroup.payments.length })}{" "}
                                        <span className="font-semibold text-green-600">
                                          {formatCurrency(paymentGroup.totalAmount)}
                                        </span>
                                      </div>
                                    </div>
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {getPaymentMethodBadge(
                                      paymentGroup.paymentMethod,
                                      t as (key: string) => string,
                                    )}
                                    {getPaymentStatusBadge(paymentGroup.status, t as (key: string) => string)}
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Group Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm bg-white rounded-lg p-3 border">
                                  <div>
                                    <span className="text-muted-foreground">{t("timeLabel")}</span>
                                    <div className="font-medium text-black">
                                      {formatDateTimeToLocaleString(paymentGroup.createdAt)}
                                    </div>
                                  </div>
                                  {paymentGroup.createdBy && (
                                    <div>
                                      <span className="text-muted-foreground">{t("createdByLabel")}</span>
                                      <div className="font-medium text-black">
                                        {paymentGroup.createdBy.name}
                                      </div>
                                    </div>
                                  )}
                                  {paymentGroup.sepayReferenceCode && (
                                    <div>
                                      <span className="text-muted-foreground">{t("referenceCodeLabel")}</span>
                                      <div className="font-mono text-xs text-black">
                                        {paymentGroup.sepayReferenceCode}
                                      </div>
                                    </div>
                                  )}
                                  {paymentGroup.sepayTransactionDate && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        {t("transactionDateLabel")}
                                      </span>
                                      <div className="font-medium text-black">
                                        {formatDateTimeToLocaleString(paymentGroup.sepayTransactionDate)}
                                      </div>
                                    </div>
                                  )}
                                  {paymentGroup.note && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">{t("noteLabel")}</span>
                                      <div className="font-medium text-black">{paymentGroup.note}</div>
                                    </div>
                                  )}
                                </div>

                                {/* Nested Payments in Group */}
                                <div className="space-y-2">
                                  <div className="text-sm font-semibold text-muted-foreground px-2">
                                    {t("groupPaymentDetail")}
                                  </div>
                                  {paymentGroup.payments.map((payment, idx) => (
                                    <div
                                      key={payment.id}
                                      className="bg-white rounded-lg border p-3 hover:border-blue-300 transition-colors"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                            {idx + 1}
                                          </div>
                                          <div>
                                            <div className="font-medium text-sm text-black">
                                              Payment #{payment.id}
                                            </div>
                                            {payment.guest && (
                                              <div className="text-xs text-muted-foreground">
                                                {t("guestLabel")} {payment.guest.name}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-green-600">
                                            {formatCurrency(payment.totalAmount)}
                                          </div>
                                          {getPaymentStatusBadge(
                                            payment.status,
                                            t as (key: string) => string,
                                          )}
                                        </div>
                                      </div>

                                      {/* Payment Orders */}
                                      {payment.orders.length > 0 && (
                                        <div className="mt-2 pt-2 border-t">
                                          <div className="text-xs text-muted-foreground mb-1">
                                            {t("paidDishes", { count: payment.orders.length })}
                                          </div>
                                          <div className="space-y-1">
                                            {payment.orders.map((order) => (
                                              <div
                                                key={order.id}
                                                className="flex items-center gap-2 text-xs bg-gray-50 rounded p-1.5"
                                              >
                                                <Image
                                                  src={order.dishSnapshot.image}
                                                  alt={order.dishSnapshot.name}
                                                  width={30}
                                                  height={30}
                                                  className="rounded"
                                                />
                                                <div className="flex-1">
                                                  <div className="font-medium text-black">
                                                    {order.dishSnapshot.name}
                                                  </div>
                                                  <div className="text-muted-foreground">
                                                    {formatCurrency(order.dishSnapshot.price)} x{" "}
                                                    {order.quantity}
                                                  </div>
                                                </div>
                                                <div className="font-semibold text-black">
                                                  {formatCurrency(order.dishSnapshot.price * order.quantity)}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Individual Payments Section */}
                      {data.individualPayments.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                            <span>
                              {t("individualPaymentsTitle", { count: data.individualPayments.length })}
                            </span>
                          </div>

                          {data.individualPayments.map((payment) => (
                            <Card key={payment.id} className="border-2 border-purple-200 bg-purple-50/30">
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                                      P{payment.id}
                                    </div>
                                    <div>
                                      <div className="text-lg">Payment #{payment.id}</div>
                                      <div className="text-sm font-normal text-muted-foreground">
                                        {t("guestLabel")}{" "}
                                        <span className="font-semibold">{payment.guest.name}</span>
                                      </div>
                                    </div>
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {getPaymentMethodBadge(
                                      payment.paymentMethod,
                                      t as (key: string) => string,
                                    )}
                                    {getPaymentStatusBadge(payment.status, t as (key: string) => string)}
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">{t("amountLabel")}</span>
                                    <div className="text-xl font-bold text-green-600">
                                      {formatCurrency(payment.totalAmount)}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">{t("timeLabel")}</span>
                                    <div className="font-medium">
                                      {formatDateTimeToLocaleString(payment.createdAt)}
                                    </div>
                                  </div>
                                  {payment.createdBy && (
                                    <div>
                                      <span className="text-muted-foreground">{t("createdByLabel")}</span>
                                      <div className="font-medium">{payment.createdBy.name}</div>
                                    </div>
                                  )}
                                  {payment.sepayReferenceCode && (
                                    <div>
                                      <span className="text-muted-foreground">{t("referenceCodeLabel")}</span>
                                      <div className="font-mono text-xs">{payment.sepayReferenceCode}</div>
                                    </div>
                                  )}
                                  {payment.sepayTransactionDate && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        {t("transactionDateLabel")}
                                      </span>
                                      <div className="font-medium">
                                        {formatDateTimeToLocaleString(payment.sepayTransactionDate)}
                                      </div>
                                    </div>
                                  )}
                                  {payment.note && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">{t("noteLabel")}</span>
                                      <div className="font-medium">{payment.note}</div>
                                    </div>
                                  )}
                                </div>

                                {/* Payment Orders */}
                                {payment.orders.length > 0 && (
                                  <div className="pt-3 border-t">
                                    <div className="text-sm font-semibold mb-2">
                                      {t("paidDishes", { count: payment.orders.length })}
                                    </div>
                                    <div className="space-y-2">
                                      {payment.orders.map((order) => (
                                        <div
                                          key={order.id}
                                          className="flex items-center gap-3 bg-white rounded-lg border p-2"
                                        >
                                          <Image
                                            src={order.dishSnapshot.image}
                                            alt={order.dishSnapshot.name}
                                            width={40}
                                            height={40}
                                            className="rounded"
                                          />
                                          <div className="flex-1">
                                            <div className="font-medium text-sm text-black">
                                              {order.dishSnapshot.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {formatCurrency(order.dishSnapshot.price)} x {order.quantity}
                                            </div>
                                          </div>
                                          <div className="font-semibold text-black">
                                            {formatCurrency(order.dishSnapshot.price * order.quantity)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
