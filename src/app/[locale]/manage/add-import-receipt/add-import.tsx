/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { formatCurrency, generateBatchNumber, handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  CreateImportReceiptBody,
  CreateImportReceiptBodyType,
} from "@/schemaValidations/import-receipt.schema";
import { useAddImportReceiptMutation } from "@/queries/useImportReceipt";
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

export default function AddImport() {
  const t = useTranslations("ManageImportReceipts");
  const addImportReceiptMutation = useAddImportReceiptMutation();
  const router = useRouter();

  const [selectedSupplier, setSelectedSupplier] = useState<{ id: number; name: string } | null>(null);

  const form = useForm<CreateImportReceiptBodyType>({
    resolver: zodResolver(CreateImportReceiptBody),
    defaultValues: {
      supplierId: 0,
      quantityIngredientImport: 0,
      importDate: "",
      note: "",
      items: [],
    },
  });

  // Sử dụng useFieldArray để quản lý array items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items", // tên field array
  });

  const reset = () => {
    form.reset();
  };

  const submit = async (values: CreateImportReceiptBodyType) => {
    if (addImportReceiptMutation.isPending) return;
    try {
      const {
        payload: { message },
      } = await addImportReceiptMutation.mutateAsync(values);

      toast.success(message, {
        duration: 2000,
      });
      reset();
      router.push("/manage/import-export-inventory?type=import");
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  const supplierId = form.getValues("supplierId");

  const [saveInfoIngredientListChoose, setSaveInfoIngredientListChoose] = useState<
    { idIngredientSupplier: number; name: string; category: string; image: string }[]
  >([]);

  const getInfoIngredientChoose = (idIngredientSupplier: number) => {
    return saveInfoIngredientListChoose.find((item) => item.idIngredientSupplier === idIngredientSupplier);
  };

  const totalAmount = fields.reduce((total, _field, index) => {
    const quantity = Number(form.watch(`items.${index}.quantity`)) || 0;
    const unitPrice = Number(form.watch(`items.${index}.unitPrice`)) || 0;
    return total + quantity * unitPrice;
  }, 0);

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

            <div className="flex items-center justify-end gap-2">
              <Button
                className="w-fit bg-green-600 hover:bg-green-500 text-white"
                onClick={() => {
                  if (supplierId > 0) {
                    append({
                      supplierIngredientId: 0,
                      quantity: 0,
                      unitPrice: 0,
                      unit: "",
                      batchNumber: "",
                      expiryDate: "",
                      note: "",
                    });
                    form.setValue("quantityIngredientImport", fields.length + 1);
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
              <Button type="submit" form="edit-dish-form">
                {t("saveImportReceipt")}
              </Button>
            </div>

            {/* Danh sách nguyên liệu */}
            {fields.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Danh sách nguyên liệu nhập ({fields.length})</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tổng tiền:</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {fields.map((field, index) => (
              <Card key={field.id} className="overflow-hidden">
                <CardContent className="p-6">
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
                                {getInfoIngredientChoose(field.value) ? (
                                  <div className="space-y-2">
                                    {getInfoIngredientChoose(field.value)?.image && (
                                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                        <Image
                                          src={getInfoIngredientChoose(field.value)?.image || ""}
                                          alt={getInfoIngredientChoose(field.value)?.name || ""}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-gray-200">
                                        {getInfoIngredientChoose(field.value)!.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {getInfoIngredientChoose(field.value)!.category}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <p className="text-sm text-gray-400">Chưa chọn</p>
                                  </div>
                                )}
                                <ChooseIngredientSupplierDialog
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
                                  placeholder="Nhập số lượng"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                                  placeholder="Nhập đơn giá"
                                  {...field}
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
                                <Input
                                  id={`items.${index}.unit`}
                                  type="text"
                                  {...field}
                                  disabled
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
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
                                <Input
                                  id={`items.${index}.batchNumber`}
                                  placeholder="Mã lô tự động"
                                  {...field}
                                  disabled
                                />
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
                                <Input id={`items.${index}.expiryDate`} type="date" {...field} />
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
                                  placeholder="Ghi chú thêm (nếu có)"
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
                            Thành tiền:
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

                    {/* Button xóa */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => {
                        remove(index);
                        const currentQuantity = form.getValues("quantityIngredientImport") || 0;
                        form.setValue("quantityIngredientImport", currentQuantity - 1);
                      }}
                      type="button"
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
