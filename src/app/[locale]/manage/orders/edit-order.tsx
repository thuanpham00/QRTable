/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpdateOrderBody, UpdateOrderBodyType } from "@/schemaValidations/order.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { handleErrorApi } from "@/lib/utils";
import { OrderStatus, OrderStatusValues } from "@/constants/type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DishesDialog } from "@/app/[locale]/manage/orders/dishes-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useGetOrderDetailQuery, useUpdateOrderMutation } from "@/queries/useOrder";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function EditOrder({
  id,
  setId,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
}) {
  const t = useTranslations("ManageOrders");

  const updateOrderMutation = useUpdateOrderMutation();
  const orderDetail = useGetOrderDetailQuery({ id: id as number, enabled: Boolean(id) });
  const dataOrderDetail = orderDetail.data?.payload.data;
  const [selectedMenuItem, setSelectedMenuItem] = useState<any | undefined>(undefined);
  const form = useForm<UpdateOrderBodyType>({
    resolver: zodResolver(UpdateOrderBody),
    defaultValues: {
      status: OrderStatus.Pending,
      menuItemId: 0,
      quantity: 1,
    },
  });

  useEffect(() => {
    if (dataOrderDetail) {
      const { dishSnapshot, quantity, status } = dataOrderDetail;
      form.reset({
        menuItemId: dishSnapshot.menuItemId ?? 0,
        quantity: quantity,
        status: status,
      });
      setSelectedMenuItem(dishSnapshot);
    }
  }, [dataOrderDetail, form]);

  const onSubmit = async (values: UpdateOrderBodyType) => {
    if (updateOrderMutation.isPending) return;
    try {
      const { payload } = await updateOrderMutation.mutateAsync({
        orderId: id as number,
        body: values,
      });
      reset();
      form.reset();
      toast.success(payload.message || "Cập nhật đơn hàng thành công", {
        duration: 4000,
      });
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  const reset = () => {
    setId(undefined);
    setSelectedMenuItem(undefined);
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
          <DialogTitle>{t("editOrder")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-order-form"
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="menuItemId"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <FormLabel>{t("dish")}</FormLabel>
                    <div className="flex items-center col-span-2 space-x-4">
                      <Avatar className="aspect-square w-30 h-30 rounded-md border-gray-500 border object-cover">
                        <AvatarImage src={selectedMenuItem?.image || selectedMenuItem?.dish?.image} />
                        <AvatarFallback className="rounded-none">
                          {selectedMenuItem?.name || selectedMenuItem?.dish?.name}
                        </AvatarFallback>
                      </Avatar>
                      <div>{selectedMenuItem?.name || selectedMenuItem?.dish?.name}</div>
                    </div>

                    <DishesDialog
                      onChoose={(dish) => {
                        field.onChange(dish.id);
                        setSelectedMenuItem(dish);
                      }}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="quantity">{t("quantity")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="quantity"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-16 text-center"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            const numberValue = Number(e.target.value);
                            if (isNaN(numberValue)) {
                              return;
                            }
                            field.onChange(numberValue);
                          }}
                        />
                        <FormMessage />
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
                      <FormLabel>{t("status")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={
                          dataOrderDetail?.status === OrderStatus.Rejected ||
                          dataOrderDetail?.status === OrderStatus.Paid
                        }
                      >
                        <FormControl className="col-span-3">
                          <SelectTrigger className="w-50">
                            <SelectValue placeholder={t("status")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OrderStatusValues.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-order-form">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
