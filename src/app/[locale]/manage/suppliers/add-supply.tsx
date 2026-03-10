/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddSupplyMutation } from "@/queries/useSupply";
import {
  CreateSupplierIngredientBody,
  CreateSupplierIngredientBodyType,
} from "@/schemaValidations/supplierIngredient.schema";
import { IngredientDialog, IngredientItem } from "@/app/[locale]/manage/suppliers/ingredient-dialog";
import { SupplierTableContext } from "@/app/[locale]/manage/suppliers/supplier-table";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

export default function AddSupply() {
  const { supplierIdEdit } = useContext(SupplierTableContext);
  const queryClient = useQueryClient();
  const t = useTranslations("ManageSupplies");
  const addSupplyMutation = useAddSupplyMutation();
  const [open, setOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientItem | null>(null);

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

  const reset = () => {
    form.reset();
  };

  const submit = async (values: CreateSupplierIngredientBodyType) => {
    if (addSupplyMutation.isPending) return;
    const body: CreateSupplierIngredientBodyType = {
      ...values,
      supplierId: supplierIdEdit as number,
    };
    try {
      const {
        payload: { message },
      } = await addSupplyMutation.mutateAsync(body);
      toast.success(message, {
        duration: 2000,
      });
      reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
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
        }
        setOpen(val);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{t("createSupply")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("createSupply")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-supplier-form"
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
          <Button type="reset" form="add-supplier-form">
            {t("cancel")}
          </Button>
          <Button type="submit" form="add-supplier-form" className="bg-blue-500 hover:bg-blue-400 text-white">
            {t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
