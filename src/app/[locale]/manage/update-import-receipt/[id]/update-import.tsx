/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { formatCurrency, generateBatchNumber, handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  UpdateImportReceiptBody,
  UpdateImportReceiptBodyType,
} from "@/schemaValidations/import-receipt.schema";
import { SupplierListDialog } from "@/app/[locale]/manage/import-export-inventory/list-supplier-dialog";
import { Input } from "@/components/ui/input";
import ChooseIngredientSupplierDialog from "@/app/[locale]/manage/add-import-receipt/choose-ingredient-supplier-dialog";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "@/i18n/routing";
import { useGetImportReceiptDetailQuery, useUpdateImportReceiptMutation } from "@/queries/useImportReceipt";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

export default function UpdateImport({ idImportReceipt }: { idImportReceipt: string }) {
  const t = useTranslations("ManageImportReceipts");
  const queryClient = useQueryClient();

  const importReceiptDetailQuery = useGetImportReceiptDetailQuery({
    id: Number(idImportReceipt),
    enabled: Boolean(idImportReceipt),
  });
  const dataImportReceiptDetail = importReceiptDetailQuery.data?.payload.data;

  const addImportReceiptMutation = useUpdateImportReceiptMutation();
  const router = useRouter();

  const [selectedSupplier, setSelectedSupplier] = useState<{ id: number; name: string } | null>(null);

  const [saveInfoIngredientListChoose, setSaveInfoIngredientListChoose] = useState<
    { idIngredientSupplier: number; name: string; category: string; image: string }[]
  >([]);

  const form = useForm<UpdateImportReceiptBodyType>({
    resolver: zodResolver(UpdateImportReceiptBody),
    defaultValues: {
      supplierId: 0,
      quantityIngredientImport: 0,
      importDate: "",
      status: "Draft",
      note: "",
      items: [],
    },
  });

  // Sử dụng useFieldArray để quản lý array items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items", // tên field array
  });

  const getInfoIngredientChoose = (idIngredientSupplier: number) => {
    return saveInfoIngredientListChoose.find((item) => item.idIngredientSupplier === idIngredientSupplier);
  };

  useEffect(() => {
    if (dataImportReceiptDetail !== undefined) {
      setSelectedSupplier({
        id: dataImportReceiptDetail.supplierId,
        name: dataImportReceiptDetail.supplierName as string,
      });
    }
  }, [dataImportReceiptDetail]);

  useEffect(() => {
    if (dataImportReceiptDetail) {
      const importDateFormatted = dataImportReceiptDetail.importDate
        ? (() => {
            const date = new Date(dataImportReceiptDetail.importDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date.toISOString().slice(0, 16);
          })()
        : "";

      setModeEdit(dataImportReceiptDetail.status === "Draft"); // Chỉ cho phép chỉnh sửa nếu trạng thái chưa là Completed hoặc Cancelled

      const mappedItems =
        dataImportReceiptDetail.items?.map((item) => {
          // Add to ingredient info cache
          if (item.ingredientName) {
            setSaveInfoIngredientListChoose((prev) => {
              const exists = prev.find((p) => p.idIngredientSupplier === item.supplierIngredientId);
              if (!exists) {
                return [
                  ...prev,
                  {
                    idIngredientSupplier: item.supplierIngredientId,
                    name: item.ingredientName || "",
                    category: item.ingredientCategory || "",
                    image: item.ingredientImage || "",
                  },
                ];
              }
              return prev;
            });
          }

          return {
            supplierIngredientId: item.supplierIngredientId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            batchNumber: item.batchNumber || "",
            expiryDate: item.expiryDate
              ? (() => {
                  const date = new Date(item.expiryDate);
                  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                  return date.toISOString().split("T")[0];
                })()
              : "",
            note: item.note || "",
            unit: item.ingredientUnit || "", // Lấy đơn vị từ item nếu có, nếu không có thì để trống. Khi chọn nguyên liệu mới sẽ tự động cập nhật đơn vị vào đây
          };
        }) || [];

      form.reset({
        supplierId: dataImportReceiptDetail.supplierId,
        importDate: importDateFormatted,
        status: (dataImportReceiptDetail.status as "Draft" | "Completed" | "Cancelled") || "Draft",
        note: dataImportReceiptDetail.note || "",
        quantityIngredientImport: mappedItems.length || 0,
        items: mappedItems,
      });
    }
  }, [dataImportReceiptDetail, form]);

  const submit = async (values: UpdateImportReceiptBodyType) => {
    if (addImportReceiptMutation.isPending) return;
    try {
      // Convert datetime-local string to ISO string with timezone
      const formattedValues = {
        ...values,
        importDate: values.importDate ? new Date(values.importDate as string).toISOString() : undefined,
        items: values.items?.map((item) => ({
          ...item,
          expiryDate: new Date(item.expiryDate).toISOString(),
        })),
      };

      const {
        payload: { message },
      } = await addImportReceiptMutation.mutateAsync({
        id: Number(idImportReceipt),
        body: formattedValues,
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-stocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stocks-no-pagination"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stocks-global"] });
      toast.success(message, {
        duration: 2000,
      });
      router.push("/manage/import-export-inventory?type=import");
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  const supplierId = form.watch("supplierId") || 0;

  const totalAmount = fields.reduce((total, _field, index) => {
    const quantity = Number(form.watch(`items.${index}.quantity`)) || 0;
    const unitPrice = Number(form.watch(`items.${index}.unitPrice`)) || 0;
    return total + quantity * unitPrice;
  }, 0);

  const [modeEdit, setModeEdit] = useState(true);

  const status = form.watch("status");
  console.log(status);

  return (
    <div>
      <Form {...form}>
        <form
          noValidate
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="edit-dish-form"
          onSubmit={form.handleSubmit(submit, (err) => {
            console.log(err);
          })}
        >
          <div className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="supplierId">{t("supplier")}</Label>
                    <div className="col-span-3 w-full">
                      <div className="flex items-center justify-between gap-2">
                        {selectedSupplier ? (
                          <Input className="w-[85%]" value={selectedSupplier.name || ""} disabled />
                        ) : (
                          <Input className="w-[85%]" value={""} disabled />
                        )}

                        <SupplierListDialog
                          disable={true}
                          onChoose={(supplier) => {
                            field.onChange(supplier.id);
                            setSelectedSupplier(supplier);
                          }}
                        />
                      </div>
                      <FormMessage>
                        {Boolean(errors.supplierId?.message) && t(errors.supplierId?.message as any)}
                      </FormMessage>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="note">{t("note")}</Label>
                    <div className="col-span-3 flex-col w-full">
                      <Textarea className="w-full" {...field} />
                      <FormMessage>
                        {Boolean(errors.note?.message) && t(errors.note?.message as any)}
                      </FormMessage>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="importDate"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="importDate">{t("importDate")}</Label>
                    <div className="col-span-3 w-full">
                      <Input
                        type="datetime-local"
                        className="w-full"
                        {...field}
                        onChange={(e) => field.onChange(String(e.target.value))}
                        disabled={!modeEdit}
                      />

                      <FormMessage>
                        {Boolean(errors.importDate?.message) && t(errors.importDate?.message as any)}
                      </FormMessage>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantityIngredientImport"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="quantityIngredientImport">{t("quantity")}</Label>
                    <div className="col-span-3 w-full">
                      <Input
                        className="w-full"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled
                      />

                      <FormMessage>
                        {Boolean(errors.quantityIngredientImport?.message) &&
                          t(errors.quantityIngredientImport?.message as any)}
                      </FormMessage>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="status">{t("status")}</Label>
                    <div className="col-span-3 w-full">
                      <Select
                        onValueChange={(val) => field.onChange(String(val))}
                        value={field.value || "Draft"}
                        disabled={!modeEdit}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("chooseStatus")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">{t("draft")}</SelectItem>
                          <SelectItem value="Completed">{t("completed")}</SelectItem>
                          <SelectItem value="Cancelled">{t("cancelled")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage>
                        {Boolean(errors.status?.message) && t(errors.status?.message as any)}
                      </FormMessage>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                className="w-fit bg-green-600 hover:bg-green-500 text-white"
                disabled={!modeEdit}
                onClick={() => {
                  if (supplierId > 0) {
                    append({
                      unit: "",
                      supplierIngredientId: 0,
                      quantity: 0,
                      unitPrice: 0,
                      batchNumber: "",
                      expiryDate: "",
                      note: "",
                    });
                  } else {
                    toast.error(t("pleaseChooseSupplier"), {
                      duration: 2000,
                    });
                  }
                }}
                type="button"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("addIngredient")}
              </Button>
              <Button type="submit" form="edit-dish-form" disabled={!modeEdit}>
                {t("saveImportReceipt")}
              </Button>
            </div>

            {/* Danh sách nguyên liệu */}
            {fields.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {t("ingredientImportList")} ({fields.length})
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("totalAmount")}:
                    </span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {fields.map((field, index) => (
              <Card key={field.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start gap-4">
                    {/* Badge số thứ tự */}
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 h-fit">
                      #{index + 1}
                    </Badge>

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Phần thông tin nguyên liệu - Bên trái */}
                      <div className="lg:col-span-3 space-y-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.supplierIngredientId`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="space-y-3">
                                {getInfoIngredientChoose(field.value || 0) ? (
                                  <div className="space-y-2">
                                    {getInfoIngredientChoose(field.value || 0)?.image && (
                                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                        <Image
                                          src={getInfoIngredientChoose(field.value || 0)?.image || ""}
                                          alt={getInfoIngredientChoose(field.value || 0)?.name || ""}
                                          fill
                                          className="object-fill"
                                        />
                                      </div>
                                    )}
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-gray-200">
                                        {getInfoIngredientChoose(field.value || 0)!.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {getInfoIngredientChoose(field.value || 0)!.category}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <p className="text-sm text-gray-400">{t("notSelected")}</p>
                                  </div>
                                )}
                                <ChooseIngredientSupplierDialog
                                  disable={modeEdit ? false : true}
                                  supplierId={supplierId}
                                  onChoose={(val) => {
                                    field.onChange(val.id);
                                    form.setValue(`items.${index}.unitPrice`, val.price);
                                    form.setValue(`items.${index}.batchNumber`, generateBatchNumber());
                                    form.setValue(`items.${index}.unit`, val.ingredient?.unit || "");
                                    setSaveInfoIngredientListChoose((prev) => [
                                      ...prev,
                                      {
                                        idIngredientSupplier: val.id,
                                        name: val.ingredient?.name || "",
                                        category: val.ingredient?.category || "",
                                        image: val.ingredient?.image || "",
                                      },
                                    ]);
                                  }}
                                />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Phần form inputs - Bên phải */}
                      <div className="lg:col-span-9">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field, formState: { errors } }) => (
                              <FormItem>
                                <Label htmlFor={`items.${index}.quantity`} className="text-sm font-medium">
                                  {t("quantity")} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`items.${index}.quantity`}
                                  type="number"
                                  placeholder={t("enterQuantity")}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  disabled={!modeEdit}
                                />
                                <FormMessage>
                                  {Boolean(errors.items?.[index]?.quantity?.message) &&
                                    t(errors.items?.[index]?.quantity?.message as any)}
                                </FormMessage>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field, formState: { errors } }) => (
                              <FormItem>
                                <Label htmlFor={`items.${index}.unitPrice`} className="text-sm font-medium">
                                  {t("unitPrice")} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`items.${index}.unitPrice`}
                                  type="number"
                                  placeholder={t("enterUnitPrice")}
                                  {...field}
                                  disabled={!modeEdit}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                                <FormMessage>
                                  {Boolean(errors.items?.[index]?.unitPrice?.message) &&
                                    t(errors.items?.[index]?.unitPrice?.message as any)}
                                </FormMessage>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.unit`}
                            render={({ field, formState: { errors } }) => (
                              <FormItem>
                                <Label htmlFor={`items.${index}.unit`} className="text-sm font-medium">
                                  {t("unit")} <span className="text-red-500">*</span>
                                </Label>
                                <Input id={`items.${index}.unit`} type="text" {...field} disabled />
                                <FormMessage>
                                  {Boolean(errors.items?.[index]?.unit?.message) &&
                                    t(errors.items?.[index]?.unit?.message as any)}
                                </FormMessage>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.batchNumber`}
                            render={({ field, formState: { errors } }) => (
                              <FormItem>
                                <Label htmlFor={`items.${index}.batchNumber`} className="text-sm font-medium">
                                  {t("batchNumber")}
                                </Label>
                                <Input id={`items.${index}.batchNumber`} {...field} disabled />
                                <FormMessage>
                                  {Boolean(errors.items?.[index]?.batchNumber?.message) &&
                                    t(errors.items?.[index]?.batchNumber?.message as any)}
                                </FormMessage>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.expiryDate`}
                            render={({ field, formState: { errors } }) => (
                              <FormItem>
                                <Label htmlFor={`items.${index}.expiryDate`} className="text-sm font-medium">
                                  {t("expiryDate")}
                                </Label>
                                <Input
                                  id={`items.${index}.expiryDate`}
                                  type="date"
                                  {...field}
                                  disabled={!modeEdit}
                                />
                                <FormMessage>
                                  {Boolean(errors.items?.[index]?.expiryDate?.message) &&
                                    t(errors.items?.[index]?.expiryDate?.message as any)}
                                </FormMessage>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.note`}
                            render={({ field, formState: { errors } }) => (
                              <FormItem>
                                <Label htmlFor={`items.${index}.note`} className="text-sm font-medium">
                                  {t("note")}
                                </Label>
                                <Input
                                  id={`items.${index}.note`}
                                  placeholder={t("additionalNote")}
                                  {...field}
                                />
                                <FormMessage>
                                  {Boolean(errors.items?.[index]?.note?.message) &&
                                    t(errors.items?.[index]?.note?.message as any)}
                                </FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 rounded-lg py-3">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t("subtotal")}:
                          </span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(
                              Number(form.watch(`items.${index}.quantity`)) *
                                Number(form.watch(`items.${index}.unitPrice`)),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => {
                        remove(index);
                      }}
                      type="button"
                      disabled={!modeEdit}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </form>
      </Form>
    </div>
  );
}
