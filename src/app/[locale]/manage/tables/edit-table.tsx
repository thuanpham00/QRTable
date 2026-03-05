/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  getTableLink,
  getVietnameseOrderModeStatus,
  getVietnameseTableStatus,
  handleErrorApi,
} from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UpdateTableBody, UpdateTableBodyType } from "@/schemaValidations/table.schema";
import { OrderModeType, OrderModeTypeValues, TableStatus, TableStatusValues } from "@/constants/type";
import { Switch } from "@/components/ui/switch";
import { Link } from "@/i18n/routing";
import { useGetTableDetailQuery, useUpdateTableMutation } from "@/queries/useTable";
import { useEffect } from "react";
import QrCodeTable from "@/components/qrcode-table";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";

export default function EditTable({
  id,
  setId,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
}) {
  const { locale } = useParams();

  const tableDetail = useGetTableDetailQuery({ id: id as number, enabled: Boolean(id) });
  const dataTableDetail = tableDetail.data?.payload.data;

  const updateTableMutation = useUpdateTableMutation();
  const t = useTranslations("ManageTables");

  const form = useForm<UpdateTableBodyType>({
    resolver: zodResolver(UpdateTableBody),
    defaultValues: {
      capacity: 2,
      status: TableStatus.Hidden,
      changeToken: false,
      notes: "",
      typeQR: OrderModeType.DINE_IN,
    },
  });

  useEffect(() => {
    if (dataTableDetail) {
      form.reset({
        capacity: dataTableDetail.capacity,
        status: dataTableDetail.status,
        changeToken: form.getValues("changeToken"),
        notes: dataTableDetail.notes ?? "",
        typeQR: dataTableDetail.typeQR,
      });
    }
  }, [dataTableDetail, form]);

  const submit = async (values: UpdateTableBodyType) => {
    if (updateTableMutation.isPending) return;
    try {
      const {
        payload: { message },
      } = await updateTableMutation.mutateAsync({
        id: id as number,
        body: values,
      });
      toast.success(message, {
        duration: 2000,
      });
      reset();
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  const reset = () => {
    setId(undefined);
    form.reset();
  };

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-5xl max-h-screen overflow-auto"
        onCloseAutoFocus={() => {
          form.reset();
          setId(undefined);
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("updateTable")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-table-form"
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1 flex flex-col gap-8">
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="name">{t("tableNumber")}</Label>
                    <div className="col-span-3 w-full space-y-2">
                      <Input
                        id="number"
                        type="number"
                        className="bg-gray-800! w-full"
                        value={dataTableDetail?.number ?? 0}
                        readOnly
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="price">{t("capacityPeople")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="capacity"
                            className="w-full"
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <FormMessage>
                            {Boolean(errors.capacity?.message) && t(errors.capacity?.message as any)}
                          </FormMessage>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="description">{t("status")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("chooseStatus")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TableStatusValues.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {getVietnameseTableStatus(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="typeQR"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="description">{t("qrType")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("chooseQrType")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {OrderModeTypeValues.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {getVietnameseOrderModeStatus(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="changeToken"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="price">{t("changeQrCode")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch id="changeToken" checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        </div>

                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="notes">{t("notes")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Textarea id="notes" className="w-full" {...field} />
                          <FormMessage>
                            {Boolean(errors.notes?.message) && t(errors.notes?.message as any)}
                          </FormMessage>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label>{t("orderUrl")}</Label>
                    <div className="col-span-3 w-full space-y-2">
                      <Link
                        href={getTableLink({
                          locale: locale as string,
                          token: dataTableDetail?.token as string,
                          tableNumber: dataTableDetail?.number as number,
                          type: dataTableDetail?.typeQR as string,
                        })}
                        target="_blank"
                        className="break-all"
                      >
                        {getTableLink({
                          locale: locale as string,
                          token: dataTableDetail?.token as string,
                          tableNumber: dataTableDetail?.number as number,
                          type: dataTableDetail?.typeQR as string,
                        })}
                      </Link>
                    </div>
                  </div>
                </FormItem>
              </div>
              <div className="col-span-1">
                <FormItem>
                  <div className="grid grid-cols-4 items-start justify-items-start gap-4">
                    <Label>{t("qrCode")}</Label>
                    {dataTableDetail && (
                      <QrCodeTable
                        token={dataTableDetail.token}
                        tableNumber={dataTableDetail.number}
                        type={dataTableDetail.typeQR}
                      />
                    )}
                    <div className="col-span-3 w-full space-y-2"></div>
                  </div>
                </FormItem>
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-table-form">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
