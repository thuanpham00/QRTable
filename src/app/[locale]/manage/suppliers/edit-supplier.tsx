/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { handleErrorApi } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGetSupplierDetailQuery, useUpdateSupplierMutation } from "@/queries/useSupplier";
import { UpdateSupplierBody, UpdateSupplierBodyType } from "@/schemaValidations/supplier.schema";
import { useTranslations } from "next-intl";

export default function EditSupplier({
  id,
  setId,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
}) {
  const t = useTranslations("ManageSuppliers");
  const supplierDetail = useGetSupplierDetailQuery({ id: id as number, enabled: Boolean(id) });
  const dataSupplierDetail = supplierDetail.data?.payload.data;
  const updateSupplierMutation = useUpdateSupplierMutation();
  const form = useForm<UpdateSupplierBodyType>({
    resolver: zodResolver(UpdateSupplierBody),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      code: "",
      note: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (dataSupplierDetail) {
      form.reset({
        name: dataSupplierDetail.name || "",
        address: dataSupplierDetail.address || "",
        phone: dataSupplierDetail.phone || "",
        email: dataSupplierDetail.email || "",
        code: dataSupplierDetail.code || "",
        note: dataSupplierDetail.note || "",
        status: (dataSupplierDetail.status as "Active" | "Inactive") || "Active",
      });
    }
  }, [dataSupplierDetail, form]);

  const submit = async (values: UpdateSupplierBodyType) => {
    if (updateSupplierMutation.isPending) return;
    let body = values;
    try {
      const {
        payload: { message },
      } = await updateSupplierMutation.mutateAsync({
        id: id as number,
        body: body,
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
      <DialogContent className="sm:max-w-150 max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("updateSupplier")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-supplier-form"
            onReset={reset}
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="code">{t("code")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="code" className="w-full" {...field} />
                        <FormMessage>
                          {Boolean(errors.code?.message) && t(errors.code?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">{t("name")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="name" className="w-full" {...field} />
                        <FormMessage>
                          {Boolean(errors.name?.message) && t(errors.name?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="phone">{t("phone")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="phone" className="w-full" {...field} />
                        <FormMessage>
                          {Boolean(errors.phone?.message) && t(errors.phone?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="address">{t("address")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="address" className="w-full" {...field} />
                        <FormMessage>
                          {Boolean(errors.address?.message) && t(errors.address?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="email">{t("email")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="email" className="w-full" {...field} />
                        <FormMessage>
                          {Boolean(errors.email?.message) && t(errors.email?.message as any)}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="status">{t("status")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("chooseStatus")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={"Active"}>Hoạt động</SelectItem>
                            <SelectItem value={"Inactive"}>Ngừng hoạt động</SelectItem>
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
          <Button type="submit" form="edit-supplier-form">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
