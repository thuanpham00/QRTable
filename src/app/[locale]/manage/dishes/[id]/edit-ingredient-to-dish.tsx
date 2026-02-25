"use client";
import IngredientsMenuDialog, {
  IngredientItem,
} from "@/app/[locale]/manage/dishes/[id]/ingredient-menu-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { handleErrorApi } from "@/lib/utils";
import { useEditIngredientToDishMutation, useGetDishIngredientItem } from "@/queries/useDish";
import {
  DishIngredientListResType,
  UpdateIngredientInDish,
  UpdateIngredientInDishType,
} from "@/schemaValidations/dish.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditIngredientToDishForm({
  id,
  setId,
  dataIngredientForDishCurrent,
}: {
  id: number | undefined;
  setId: (value: number | undefined) => void;
  dataIngredientForDishCurrent: DishIngredientListResType["data"];
}) {
  const dishIngredientDetail = useGetDishIngredientItem({
    id: id as number,
    enabled: !!id,
  });
  const dishIngredientData = dishIngredientDetail.data?.payload.data;

  const editIngredientToDishMutation = useEditIngredientToDishMutation();
  const listIdIngredient = dataIngredientForDishCurrent.map((item) => item.ingredientId);

  const [selectIngredient, setSelectedIngredient] = useState<IngredientItem | null>(null);

  const form = useForm<UpdateIngredientInDishType>({
    resolver: zodResolver(UpdateIngredientInDish),
    defaultValues: {
      dishId: undefined,
      ingredientId: undefined,
      quantity: 0,
      unit: "",
      isMain: false,
      isOptional: false,
    },
  });

  useEffect(() => {
    if (dishIngredientData) {
      form.reset({
        dishId: dishIngredientData.dishId,
        ingredientId: dishIngredientData.ingredientId,
        quantity: Number(dishIngredientData.quantity),
        unit: dishIngredientData.unit,
        isMain: dishIngredientData.isMain,
        isOptional: dishIngredientData.isOptional,
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIngredient(dishIngredientData.ingredient);
    }
  }, [form, dishIngredientData]);

  const reset = () => {
    setId(undefined);
    setSelectedIngredient(null);
    form.reset();
  };

  const submit = async (values: UpdateIngredientInDishType) => {
    try {
      if (!selectIngredient) {
        toast.error("Vui lòng chọn món ăn.", { duration: 2000 });
        return;
      }

      const body = {
        ...values,
      };
      const {
        payload: { message },
      } = await editIngredientToDishMutation.mutateAsync({
        idDishIngredient: id as number,
        body,
      });
      toast.success(message, { duration: 2000 });
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
                  name="ingredientId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="dishId">Tên nguyên liệu</Label>
                        <div className="col-span-3 w-full space-y-2 flex items-start gap-6">
                          <div className="flex items-start gap-2">
                            <Avatar className="aspect-square w-12.5 h-12.5 rounded-md object-cover flex flex-col">
                              <AvatarImage src={selectIngredient?.image} />
                              <AvatarFallback className="rounded-none">
                                {selectIngredient?.name}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{selectIngredient?.name}</div>
                            </div>
                          </div>

                          <IngredientsMenuDialog
                            listIdIngredient={listIdIngredient}
                            onChoose={(ingredient) => {
                              field.onChange(ingredient.id);
                              setSelectedIngredient(ingredient);
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="quantity">Số lượng</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="quantity"
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

                {/* Đơn vị phổ biến */}
                {/** Đặt mảng đơn vị phổ biến ở đầu file hoặc ngoài component */}
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => {
                    const units = [
                      "gam",
                      "kg",
                      "ml",
                      "lít",
                      "muỗng",
                      "thìa",
                      "chén",
                      "quả",
                      "củ",
                      "miếng",
                      "hộp",
                      "gói",
                      "cái",
                      "lá",
                      "cây",
                      "bịch",
                      "viên",
                      "ống",
                    ];
                    return (
                      <FormItem>
                        <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                          <Label htmlFor="unit">Đơn vị</Label>
                          <div className="col-span-3 w-full space-y-2">
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn đơn vị" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="isMain"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="isMain">Nguyên liệu chính</Label>
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
                        <Label htmlFor="isOptional">Tùy chọn</Label>
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
