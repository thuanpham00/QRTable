/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import IngredientsMenuDialog from "@/app/[locale]/manage/dishes/[id]/ingredient-menu-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { handleErrorApi } from "@/lib/utils";
import { useAddIngredientToDishMutation } from "@/queries/useDish";
import {
  AddIngredientToDish,
  AddIngredientToDishType,
  DishIngredientListResType,
} from "@/schemaValidations/dish.schema";
import { IngredientListResType } from "@/schemaValidations/ingredient.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function AddIngredientToDishForm({
  idDish,
  dataIngredientForDishCurrent,
}: {
  idDish: number;
  dataIngredientForDishCurrent: DishIngredientListResType["data"];
}) {
  const t = useTranslations("ManageDishes");
  const addIngredientToDish = useAddIngredientToDishMutation();
  const listIdIngredient = dataIngredientForDishCurrent.map((item) => item.ingredientId);

  const [open, setOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientListResType["data"][0] | null>(null);
  const form = useForm<AddIngredientToDishType>({
    resolver: zodResolver(AddIngredientToDish),
    defaultValues: {
      dishId: idDish,
      ingredientId: 0,
      quantity: 1,
      isOptional: false,
      isMain: false,
    },
  });

  const reset = () => {
    form.reset();
    setSelectedIngredient(null);
  };

  const submit = async (values: AddIngredientToDishType) => {
    try {
      if (!setSelectedIngredient) {
        toast.error("Vui lòng chọn nguyên liệu.", { duration: 2000 });
        return;
      }

      const body = {
        ...values,
        dishId: idDish,
      };
      const {
        payload: { message },
      } = await addIngredientToDish.mutateAsync(body);
      toast.success(message, { duration: 2000 });
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
          <Button size="sm" className="h-9 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{t("addIngredient")}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>{t("addIngredient")}</DialogTitle>
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
                  name="ingredientId"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="dishId">{t("nameIngredient")}</Label>
                        <div className="col-span-3 w-full space-y-2 flex items-start gap-6">
                          <div className="flex items-start gap-2">
                            <Avatar className="aspect-square w-12.5 h-12.5 rounded-md object-cover flex flex-col">
                              <AvatarImage src={selectedIngredient?.image} />
                              <AvatarFallback className="rounded-none">
                                {selectedIngredient?.name}
                              </AvatarFallback>
                            </Avatar>
                            {selectedIngredient && (
                              <div>
                                <div>{selectedIngredient?.name}</div>
                                <div className="text-black dark:text-gray-300 text-sm">
                                  Đơn vị: {selectedIngredient?.unit}
                                </div>
                              </div>
                            )}
                          </div>

                          <IngredientsMenuDialog
                            listIdIngredient={listIdIngredient}
                            onChoose={(ingredient) => {
                              field.onChange(ingredient.id);
                              setSelectedIngredient(ingredient);
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

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="quantity">{t("quantity")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="quantity"
                            type="number"
                            className="w-full"
                            step="any"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                          <FormMessage>
                            {Boolean(errors.quantity?.message) && t(errors.quantity?.message as any)}
                          </FormMessage>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isMain"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="isMain">{t("isMain")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isOptional"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="isOptional">{t("isOptional")}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                {t("add")}
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
