"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { handleErrorApi } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGetDishCategoryDetailQuery, useUpdateDishCategoryMutation } from "@/queries/useDishCategory";
import { UpdateDishCategoryBody, UpdateDishCategoryBodyType } from "@/schemaValidations/dishCategory.schema";

export default function EditDishCategory({
  id,
  setId,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
}) {
  const dishCategoryDetail = useGetDishCategoryDetailQuery({ id: id as number, enabled: Boolean(id) });
  const dataDishCategoryDetail = dishCategoryDetail.data?.payload.data;

  const updateDishCategoryMutation = useUpdateDishCategoryMutation();

  const form = useForm<UpdateDishCategoryBodyType>({
    resolver: zodResolver(UpdateDishCategoryBody),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (dataDishCategoryDetail) {
      form.reset({
        name: dataDishCategoryDetail.name,
        description: dataDishCategoryDetail.description || "",
      });
    }
  }, [dataDishCategoryDetail, form]);

  const submit = async (values: UpdateDishCategoryBodyType) => {
    if (updateDishCategoryMutation.isPending) return;
    try {
      const {
        payload: { message },
      } = await updateDishCategoryMutation.mutateAsync({
        id: id as number,
        body: values,
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
          <DialogTitle>Cập nhật danh mục </DialogTitle>
          <DialogDescription>Các trường sau đây là bắt buộc: Tên</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-dish-form"
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
          <Button type="submit" form="edit-dish-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
