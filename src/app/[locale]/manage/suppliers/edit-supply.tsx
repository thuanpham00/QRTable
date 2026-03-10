/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetSupplyDetailQuery, useUpdateSupplyMutation } from "@/queries/useSupply";
import {
  CreateSupplierIngredientBody,
  CreateSupplierIngredientBodyType,
  UpdateSupplierIngredientBodyType,
} from "@/schemaValidations/supplierIngredient.schema";
import { IngredientDialog, IngredientItem } from "@/app/[locale]/manage/suppliers/ingredient-dialog";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { SupplyTableContext } from "@/app/[locale]/manage/suppliers/show-supply.dialog";

export default function EditSupply() {
  const { supplyIdEdit, setSupplyIdEdit } = useContext(SupplyTableContext);
  console.log(supplyIdEdit);
  const queryClient = useQueryClient();
  const t = useTranslations("ManageSupplies");
  const supplyDetail = useGetSupplyDetailQuery({
    id: supplyIdEdit as number,
    enabled: Boolean(supplyIdEdit),
  });
  const dataSupplyDetail = supplyDetail.data?.payload.data;

  const updateSupplyMutation = useUpdateSupplyMutation();
  const [selectedIngredient, setSelectedIngredient] = useState<
    IngredientItem | { id: number; name: string; image: string } | null
  >(null);

  const form = useForm<CreateSupplierIngredientBodyType>({
    resolver: zodResolver(CreateSupplierIngredientBody),
    defaultValues: {
      supplierId: 0,
      ingredientId: 0,
      price: 0,
      isPreferred: false,
      note: "",
    },
  });

  // Reset form khi data thay đổi
  useEffect(() => {
    if (dataSupplyDetail) {
      form.reset({
        supplierId: dataSupplyDetail.supplierId || 0,
        ingredientId: dataSupplyDetail.ingredientId || 0,
        price: dataSupplyDetail.price || 0,
        isPreferred: dataSupplyDetail.isPreferred || false,
        note: dataSupplyDetail.note || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSupplyDetail]);

  // Load ingredient khi mở dialog edit
  useEffect(() => {
    if (dataSupplyDetail?.ingredient) {
      setSelectedIngredient({
        id: dataSupplyDetail.ingredientId,
        name: dataSupplyDetail.ingredient.name,
        image: dataSupplyDetail.ingredient.image || "",
      });
    } else {
      setSelectedIngredient(null);
    }
  }, [supplyIdEdit, dataSupplyDetail?.ingredientId, dataSupplyDetail?.ingredient]);

  const reset = () => {
    form.reset();
    setSelectedIngredient(null);
  };

  const submit = async (values: UpdateSupplierIngredientBodyType) => {
    if (updateSupplyMutation.isPending) return;
    const body: UpdateSupplierIngredientBodyType = values;
    try {
      const {
        payload: { message },
      } = await updateSupplyMutation.mutateAsync({
        id: supplyIdEdit as number,
        body,
      });
      toast.success(message, {
        duration: 2000,
      });
      reset();
      setSupplyIdEdit(undefined);
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  return (
    <Dialog
      onOpenChange={(val) => {
        if (!val) {
          reset();
          setSupplyIdEdit(undefined);
        }
      }}
      open={Boolean(supplyIdEdit)}
    >
      <DialogContent className="sm:max-w-150 max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("updateSupply")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-supply-form"
            onReset={reset}
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
                    <div className="hidden">
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="code" className="w-full" {...field} />
                        <FormMessage>
                          {Boolean(errors.supplierId?.message) && t(errors.supplierId?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {!selectedIngredient && (
                <FormField
                  control={form.control}
                  name="ingredientId"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="name">{t("nameIngredient")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <IngredientDialog
                            onChoose={(val) => {
                              field.onChange(val.id);
                              setSelectedIngredient(val);
                            }}
                          />
                          <FormMessage>
                            {Boolean(errors.ingredientId?.message) && t(errors.ingredientId?.message as any)}
                          </FormMessage>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {selectedIngredient && (
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label htmlFor="name">{t("nameIngredient")}</Label>
                  <div className="col-span-3 w-full flex items-center gap-4">
                    <Image
                      src={selectedIngredient.image}
                      alt={selectedIngredient.name}
                      className="w-16 h-16 rounded-xl"
                      width={64}
                      height={64}
                    />
                    <span>{selectedIngredient.name}</span>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="price"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">{t("price")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="price"
                          type="number"
                          className="w-full"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                        <FormMessage>
                          {Boolean(errors.price?.message) && t(errors.price?.message as any)}
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
                      <div className="col-span-3 w-full space-y-2">
                        <Textarea id="note" className="w-full" {...field} />
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
                name="isPreferred"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="isPreferred">{t("preferred")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select
                          onValueChange={(val) => field.onChange(val === "true")}
                          defaultValue={String(field.value)}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("choose")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={"true"}>Ưu tiên</SelectItem>
                            <SelectItem value={"false"}>Không ưu tiên</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-supply-form" className="bg-blue-500 hover:bg-blue-400 text-white">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
