"use client";
import IngredientsMenuDialog from "@/app/[locale]/manage/dishes/[id]/ingredient-menu-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const addIngredientToDish = useAddIngredientToDishMutation();
  const listIdIngredient = dataIngredientForDishCurrent.map((item) => item.ingredientId);

  const [open, setOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientListResType["data"][0] | null>(null);
  const form = useForm<AddIngredientToDishType>({
    resolver: zodResolver(AddIngredientToDish),
    defaultValues: {
      dishId: idDish,
      ingredientId: undefined,
      quantity: 1,
      unit: "",
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
          <Button size="sm" className="h-7 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Thêm nguyên liệu vào món ăn</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Thêm nguyên liệu vào món ăn</DialogTitle>
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
                              <AvatarImage src={selectedIngredient?.image} />
                              <AvatarFallback className="rounded-none">
                                {selectedIngredient?.name}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{selectedIngredient?.name}</div>
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
              <Button type="reset" form="add-dish-to-menu-form">
                Hủy
              </Button>
              <Button
                type="submit"
                form="add-dish-to-menu-form"
                className="bg-blue-500 hover:bg-blue-400 text-white"
              >
                Thêm
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
