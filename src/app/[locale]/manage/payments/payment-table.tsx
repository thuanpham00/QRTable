/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Input } from "@/components/ui/input";
import { createContext, useState } from "react";
import AutoPagination from "@/components/auto-pagination";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import {
  GetPaymentsQueryType,
  PaymentListResType,
  SearchPayment,
  SearchPaymentType,
} from "@/schemaValidations/payment.schema";
import { useGetListPaymentQuery } from "@/queries/usePayment";
import FormPaymentDetail from "@/app/[locale]/manage/payments/form-payment-detail";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/routing";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import PaymentItem, { getGroupColor } from "@/app/[locale]/manage/payments/payment-item";
import { formatCurrency } from "@/lib/utils";

export type PaymentItemType = PaymentListResType["data"][0];

// sử dụng trong phạm vị component AccountTable và các component con của nó
export const PaymentTableContext = createContext<{
  setPaymentIdEdit: (value: number) => void;
  paymentIdEdit: number | undefined;
}>({
  setPaymentIdEdit: (value: number | undefined) => {},
  paymentIdEdit: undefined,
});

export default function PaymentTable() {
  const t = useTranslations("ManagePayments");

  const router = useRouter();
  const queryParams = useQueryParams();

  const limit = queryParams.limit ? Number(queryParams.limit) : 10;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: GetPaymentsQueryType = omitBy(
    {
      page,
      limit,
      fromDate: queryParams.fromDate ? new Date(queryParams.fromDate as string).toISOString() : undefined,
      toDate: queryParams.toDate ? new Date(queryParams.toDate as string).toISOString() : undefined,
      paymentMethod: queryParams.paymentMethod ? queryParams.paymentMethod : undefined,
      numberTable: queryParams.numberTable ? Number(queryParams.numberTable) : undefined,
    },
    isUndefined,
  ) as GetPaymentsQueryType;

  const form = useForm<SearchPaymentType>({
    resolver: zodResolver(SearchPayment),
    defaultValues: {
      fromDate: queryParams.fromDate ? new Date(queryParams.fromDate as string).toISOString() : undefined,
      toDate: queryParams.toDate ? new Date(queryParams.toDate as string).toISOString() : undefined,
      paymentMethod: queryParams.paymentMethod as "CASH" | "SEPAY" | undefined,
      numberTable: queryParams.numberTable ? Number(queryParams.numberTable) : undefined,
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({
        page: 1,
        limit: queryConfig.limit,
        fromDate: undefined,
        toDate: undefined,
        paymentMethod: undefined,
        numberTable: undefined,
      })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset({ fromDate: undefined, toDate: undefined, paymentMethod: undefined, numberTable: undefined });
    router.push(`/manage/payments?${params.toString()}`);
  };

  const submit = (data: SearchPaymentType) => {
    const params = new URLSearchParams(
      Object.entries({
        ...queryConfig,
        page: 1,
        fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : undefined,
        toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined,
        paymentMethod: data.paymentMethod ? data.paymentMethod : undefined,
        numberTable: data.numberTable ? data.numberTable : undefined,
      })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/payments?${params.toString()}`);
  };

  const invalidSubmit = (err: FieldErrors<SearchPaymentType>) => {
    console.log(err);
    if (err.fromDate) {
      toast.error(err.fromDate.message || t("invalidDate"), {
        duration: 4000,
      });
    }
    if (err.toDate) {
      toast.error(err.toDate.message || t("invalidDate"), {
        duration: 4000,
      });
    }
  };

  const [paymentIdEdit, setPaymentIdEdit] = useState<number | undefined>();

  const listPayment = useGetListPaymentQuery(queryConfig);

  const data: PaymentListResType["data"] = listPayment.data?.payload.data || [];
  const currentPage =
    (listPayment.data?.payload.pagination && listPayment.data?.payload.pagination.page) || 0;
  const totalPages =
    (listPayment.data?.payload.pagination && listPayment.data?.payload.pagination.totalPages) || 0;
  const total = (listPayment.data?.payload.pagination && listPayment.data?.payload.pagination.total) || 0;

  // Tạo map để track các payment group và đếm số lượng payment trong mỗi group
  const paymentGroups: Record<string, PaymentItemType[]> = {};
  data.forEach((payment) => {
    if (payment.paymentGroup) {
      const groupId = payment.paymentGroup.id;
      if (!paymentGroups[groupId]) paymentGroups[groupId] = [];
      paymentGroups[groupId].push(payment);
    } else {
      if (!paymentGroups[`no-group`]) paymentGroups[`no-group`] = [];
      paymentGroups[`no-group`].push(payment);
    }
  });

  console.log(paymentGroups);
  //Đúng, bill chung (paymentGroup) nên dùng cho admin để quản lý, theo dõi nhóm thanh toán và biết nhóm đó gồm những bill lẻ của khách nào.
  //Còn khách thì chỉ nên thấy bill lẻ của mình để biết chi tiết đã order món nào, số tiền từng lần thanh toán, lịch sử cá nhân.
  return (
    <PaymentTableContext.Provider value={{ paymentIdEdit, setPaymentIdEdit }}>
      <div className="w-full">
        <Form {...form}>
          <form
            noValidate
            className="py-4"
            onReset={reset}
            onSubmit={form.handleSubmit(submit, invalidSubmit)}
          >
            <div className="grid grid-cols-4 items-center">
              <div className="col-span-3 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="fromDate"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <span className="mr-2 text-sm">{t("from")}</span>
                          <Input
                            type="datetime-local"
                            placeholder={t("fromDate")}
                            className="text-sm"
                            value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                            onChange={(event) =>
                              field.onChange(event.target.value ? new Date(event.target.value) : undefined)
                            }
                          />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toDate"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <span className="mr-2 text-sm">{t("to")}</span>
                          <Input
                            type="datetime-local"
                            placeholder={t("toDate")}
                            className="text-sm"
                            value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                            onChange={(event) =>
                              field.onChange(event.target.value ? new Date(event.target.value) : undefined)
                            }
                          />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <span className="mr-2 text-sm">{t("paymentMethodLabel")}</span>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("chooseOption")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CASH">{t("cash")}</SelectItem>
                              <SelectItem value="SEPAY">{t("sepay")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberTable"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <span className="mr-2 text-sm">{t("tableNumberLabel")}</span>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? undefined : Number(value));
                            }}
                          />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button className="" variant={"outline"} type="reset">
                  Reset
                </Button>
                <Button className="bg-blue-500!" variant={"outline"} type="submit">
                  <Search color="white" />
                </Button>
              </div>
            </div>
          </form>
        </Form>
        <div className="rounded-md border">
          <FormPaymentDetail id={paymentIdEdit} setId={setPaymentIdEdit} />

          <div className="grid grid-cols-10 gap-2 items-center justify-start p-2 text-sm">
            <div className="col-span-1">Type</div>
            <div className="col-span-1">{t("tableGuest")}</div>
            <div className="col-span-1">{t("totalAmount")}</div>
            <div className="col-span-1">{t("paymentMethod")}</div>
            <div className="col-span-1">{t("status")}</div>
            <div className="col-span-1">{t("orders")}</div>
            <div className="col-span-1">{t("createdBy")}</div>
            <div className="col-span-1">{t("createdAt")}</div>
            <div className="col-span-1">{t("note")}</div>
            <div className="col-span-1">{t("actions")}</div>
          </div>

          {data.length > 0 &&
            Object.entries(paymentGroups).map(([groupId, payments]) => {
              const totalAmountGroup = payments.reduce((acc, payment) => acc + payment.totalAmount, 0);
              return (
                <div key={groupId}>
                  {groupId !== "no-group" && (
                    <div
                      className={`grid grid-cols-10 gap-2 items-center pl-2 py-2 border-l-4 ${getGroupColor(Number(groupId))}`}
                    >
                      <div className="col-span-1 text-sm">{t("billGroup", { id: groupId })}</div>
                      <div className="col-span-1 text-sm"> </div>
                      <div className="col-span-1 text-sm font-semibold text-orange-600">
                        {formatCurrency(totalAmountGroup)}
                      </div>
                    </div>
                  )}

                  {payments.map((payment: PaymentItemType, index: number) => (
                    <PaymentItem
                      data={payment}
                      paymentGroups={paymentGroups}
                      key={payment.id}
                      indexForGroup={index + 1}
                    />
                  ))}
                </div>
              );
            })}
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-xs text-muted-foreground py-4 flex-1 ">
            {t("showingOf", { count: data.length, total })}
          </div>
          <div>
            <AutoPagination
              queryConfig={queryConfig}
              page={currentPage}
              totalPages={totalPages}
              pathname="/manage/payments"
            />
          </div>
        </div>
      </div>
    </PaymentTableContext.Provider>
  );
}
