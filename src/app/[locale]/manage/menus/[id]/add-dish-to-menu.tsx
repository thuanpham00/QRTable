/* eslint-disable @typescript-eslint/no-explicit-any */
import revalidateApiRequests from "@/apiRequests/revalidate";
import DishesMenuDialog, { DishItem } from "@/app/[locale]/manage/menus/[id]/dishes-menu-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ListMenuItemStatus, MenuItemStatus } from "@/constants/type";
import { formatCurrency, handleErrorApi } from "@/lib/utils";
import { useAddMenuItemMutation } from "@/queries/useMenu";
import { AddDishToMenu, AddDishToMenuType, MenuItemListResType } from "@/schemaValidations/menu.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function AddDishToMenuForm({
  idMenu,
  dataMenuItemsCurrent,
}: {
  idMenu: number;
  dataMenuItemsCurrent: MenuItemListResType["data"]["itemList"];
}) {
  const t = useTranslations("ManageMenus");
  const addMenuItemMutation = useAddMenuItemMutation();
  const listIdDish = dataMenuItemsCurrent.map((item) => item.dishId);

  const [open, setOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishItem | null>(null);
  const form = useForm<AddDishToMenuType>({
    resolver: zodResolver(AddDishToMenu),
    defaultValues: {
      dishId: 0,
      price: 0,
      notes: "",
      status: MenuItemStatus.AVAILABLE,
    },
  });

  const reset = () => {
    form.reset();
    setSelectedDish(null);
  };

  const submit = async (values: AddDishToMenuType) => {
    try {
      if (!selectedDish) {
        toast.error(t("chooseDishRequired"), { duration: 2000 });
        return;
      }
      if (selectedDish && selectedDish?.price >= values.price) {
        toast.error(t("menuPriceHigher"), { duration: 2000 });
        return;
      }
      const body = {
        ...values,
        menuId: idMenu,
      };
      const {
        payload: { message },
      } = await addMenuItemMutation.mutateAsync(body);
      toast.success(message, { duration: 2000 });
      await revalidateApiRequests("menus");
      reset();
      setOpen(false);
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) {
            reset();
          }
          setOpen(val);
        }}
      >
        <DialogTrigger asChild>
          <Button size="sm" className="h-7 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{t("addDishToMenu")}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>{t("addDishToMenu")}</DialogTitle>
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
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="dishId">{t("nameDish")}</Label>
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
                          <FormMessage>
                            {Boolean(errors.dishId?.message) && t(errors.dishId?.message as any)}
                          </FormMessage>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="price">{t("menuPrice")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="price"
                            type="number"
                            className="w-full"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="status">{t("status")}</Label>
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
              <Button type="reset" form="add-dish-to-menu-form">
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                form="add-dish-to-menu-form"
                className="bg-blue-500 hover:bg-blue-400 text-white"
              >
                {t("create")}
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
