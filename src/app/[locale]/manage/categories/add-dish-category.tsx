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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { handleErrorApi } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CreateDishCategoryBody, CreateDishCategoryBodyType } from "@/schemaValidations/dishCategory.schema";
import { useAddDishCategoryMutation } from "@/queries/useDishCategory";

export default function AddDishCategory() {
  const addDishCategoryMutation = useAddDishCategoryMutation();

  const [open, setOpen] = useState(false);
  const form = useForm<CreateDishCategoryBodyType>({
    resolver: zodResolver(CreateDishCategoryBody),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const reset = () => {
    form.reset();
  };

  const submit = async (values: CreateDishCategoryBodyType) => {
    if (addDishCategoryMutation.isPending) return;
    try {
      const {
        payload: { message },
      } = await addDishCategoryMutation.mutateAsync(values);

      toast.success(message, {
        duration: 2000,
      });
      reset();
      setOpen(false);
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Thêm danh mục</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Thêm danh mục</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-dish-category-form"
            onReset={reset}
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">Tên danh mục</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="name" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="description">Mô tả danh mục</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Textarea id="description" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="reset" form="add-dish-category-form">
            Xóa
          </Button>
          <Button
            type="submit"
            form="add-dish-category-form"
            className="bg-blue-500 hover:bg-blue-400 text-white"
          >
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
