/* eslint-disable react-hooks/incompatible-library */
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
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handleErrorApi } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUploadMutation } from "@/queries/useMedia";
import { useGetIngredientDetailQuery, useUpdateIngredientMutation } from "@/queries/useIngredient";
import { UpdateIngredientBody, UpdateIngredientBodyType } from "@/schemaValidations/ingredient.schema";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function EditIngredient({
  id,
  setId,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
}) {
  const ingredientDetail = useGetIngredientDetailQuery({ id: id as number, enabled: Boolean(id) });
  const dataIngredientDetail = ingredientDetail.data?.payload.data;
  const uploadMutation = useUploadMutation();
  const updateIngredientMutation = useUpdateIngredientMutation();
  const [file, setFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<UpdateIngredientBodyType>({
    resolver: zodResolver(UpdateIngredientBody),
    defaultValues: {
      name: "",
      description: "",
      allergenType: "",
      isVegetarian: false,
      isVegan: false,
      category: "",
      image: undefined,
      isActive: true,
    },
  });
  const image = form.watch("image");
  const name = form.watch("name");
  const previewAvatarFromFile = file ? URL.createObjectURL(file) : image;

  useEffect(() => {
    if (dataIngredientDetail) {
      form.reset({
        name: dataIngredientDetail.name || "",
        description: dataIngredientDetail.description || "",
        allergenType: dataIngredientDetail.allergenType || "",
        isVegetarian: dataIngredientDetail.isVegetarian,
        isVegan: dataIngredientDetail.isVegan,
        category: dataIngredientDetail.category || "",
        image: dataIngredientDetail.image || undefined,
        isActive: dataIngredientDetail.isActive,
      });
    }
  }, [dataIngredientDetail, form]);

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = e.target.files?.[0];
    if (fileFormLocal && !fileFormLocal.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ.", {
        duration: 2000,
      });
    } else {
      toast.success("Ảnh nguyên liệu hợp lệ", {
        duration: 2000,
      });
      setFile(fileFormLocal as File);
    }
  };

  const submit = async (values: UpdateIngredientBodyType) => {
    if (updateIngredientMutation.isPending) return;
    let body = values;
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const { payload } = await uploadMutation.mutateAsync(formData);
        const urlImage = payload.data;
        body = {
          ...values,
          image: urlImage,
        };
      }
      const {
        payload: { message },
      } = await updateIngredientMutation.mutateAsync({
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
    setFile(null);
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
          <DialogTitle>Cập nhật nguyên liệu</DialogTitle>
          <DialogDescription>Các trường sau đây là bắt buộc: Tên, ảnh</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-ingredient-form"
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-25 h-25 rounded-md object-cover">
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className="rounded-none">{name || "Ảnh nguyên liệu"}</AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        onChange={(e) => {
                          handleChangeFile(e);
                          field.onChange("http://localhost:3000/" + field.name);
                        }}
                        className="hidden"
                      />
                      <button
                        className="flex aspect-square w-25 items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">Tên nguyên liệu</Label>
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="category">Nhóm nguyên liệu</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhóm nguyên liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rau-cu">Rau củ</SelectItem>
                            <SelectItem value="thit-ca">Thịt cá</SelectItem>
                            <SelectItem value="gia-vi">Gia vị</SelectItem>
                            <SelectItem value="khac">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergenType"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="allergenType">Loại dị ứng</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="allergenType" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isVegetarian"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="isVegetarian">Ăn chay</Label>
                      <div className="col-span-3 w-full space-y-2 flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isVegan"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="isVegan">Thuần chay</Label>
                      <div className="col-span-3 w-full space-y-2 flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                      <Label htmlFor="description">Mô tả</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Textarea id="description" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="isActive">Trạng thái</Label>
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
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-ingredient-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
