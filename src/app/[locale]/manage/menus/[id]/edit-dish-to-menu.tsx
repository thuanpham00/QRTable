/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import revalidateApiRequests from "@/apiRequests/revalidate";
import DishesMenuDialog, { DishItem } from "@/app/[locale]/manage/menus/[id]/dishes-menu-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ListMenuItemStatus, MenuItemStatus } from "@/constants/type";
import { formatCurrency, handleErrorApi } from "@/lib/utils";
import { useEditMenuItemMutation, useGetMenuItemDetail } from "@/queries/useMenu";
import { MenuItemListResType, UpdateDishInMenu, UpdateDishInMenuType } from "@/schemaValidations/menu.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditDishToMenuForm({
  id,
  setId,
  dataMenuItemsCurrent,
}: {
  id: number | undefined;
  setId: (value: number | undefined) => void;
  dataMenuItemsCurrent: MenuItemListResType["data"]["itemList"];
}) {
  const menuItemDetail = useGetMenuItemDetail({
    id: id as number,
    enabled: !!id,
  });
  const menuItemData = menuItemDetail.data?.payload.data;

  const editMenuItemMutation = useEditMenuItemMutation();
  const listIdDish = dataMenuItemsCurrent.map((item) => item.dishId);

  const [selectedDish, setSelectedDish] = useState<DishItem | null>(null);
  const form = useForm<UpdateDishInMenuType>({
    resolver: zodResolver(UpdateDishInMenu),
    defaultValues: {
      dishId: 0,
      price: 0,
      notes: "",
      status: MenuItemStatus.AVAILABLE,
    },
  });

  useEffect(() => {
    if (menuItemData) {
      form.reset({
        dishId: menuItemData.dishId,
        price: menuItemData.price,
        notes: menuItemData.notes || "",
        status: menuItemData.status,
      });
      setSelectedDish(menuItemData.dish);
    }
  }, [form, menuItemData]);

  const reset = () => {
    setId(undefined);
    setSelectedDish(null);
    form.reset();
  };

  const submit = async (values: UpdateDishInMenuType) => {
    try {
      if (!selectedDish) {
        toast.error("Vui lòng chọn món ăn.", { duration: 2000 });
        return;
      }
      if (selectedDish && selectedDish?.price >= values.price) {
        toast.error("Giá menu phải cao hơn giá món ăn.", { duration: 2000 });
        return;
      }
      const body = {
        ...values,
      };
      const {
        payload: { message },
      } = await editMenuItemMutation.mutateAsync({
        idMenuItem: id as number,
        body,
      });
      toast.success(message, { duration: 2000 });
      await revalidateApiRequests("menus");
      reset();
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  return (
    <div>
      <Dialog
        open={Boolean(!!id)}
        onOpenChange={(val) => {
          if (!val) {
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa món ăn</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              noValidate
              className="grid auto-rows-max items-start gap-4 md:gap-8"
              id="add-dish-to-menu-form"
              onReset={reset}
              onSubmit={form.handleSubmit(submit, (err) => {
                console.log(err);
              })}
            >
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="dishId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="dishId">Tên món ăn</Label>
                        <div className="col-span-3 w-full space-y-2 flex items-start gap-6">
                          <div className="flex items-start gap-2">
                            <Avatar className="aspect-square w-12.5 h-12.5 rounded-md object-cover flex flex-col">
                              <AvatarImage src={selectedDish?.image} />
                              <AvatarFallback className="rounded-none">{selectedDish?.name}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{selectedDish?.name}</div>
                              <div>{formatCurrency((selectedDish?.price as number) || 0)}</div>
                            </div>
                          </div>

                          <DishesMenuDialog
                            listIdDish={listIdDish}
                            onChoose={(dish) => {
                              field.onChange(dish.id);
                              setSelectedDish(dish);
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="price">Giá Menu</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="price"
                            type="number"
                            className="w-full"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Textarea id="notes" className="w-full" {...field} />
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
                        <Label htmlFor="status">Trạng thái</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ListMenuItemStatus.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>

            <div className="flex items-center justify-end gap-2">
              <Button type="submit" form="add-dish-to-menu-form">
                Lưu
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
