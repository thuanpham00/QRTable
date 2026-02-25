/* eslint-disable react-hooks/incompatible-library */
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
import { PlusCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getVietnameseDishStatus, handleErrorApi } from "@/lib/utils";
import { CreateDishBody, CreateDishBodyType } from "@/schemaValidations/dish.schema";
import { DishStatus, DishStatusValues } from "@/constants/type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUploadMutation } from "@/queries/useMedia";
import { useAddDishMutation } from "@/queries/useDish";
import { useGetListDishCategoryNameQuery } from "@/queries/useDishCategory";

export default function AddDish() {
  const uploadMutation = useUploadMutation();
  const addDishMutation = useAddDishMutation();
  const listNameDishCategory = useGetListDishCategoryNameQuery();
  const dishCategories = listNameDishCategory.data?.payload.data || [];

  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<CreateDishBodyType>({
    resolver: zodResolver(CreateDishBody),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      status: DishStatus.Discontinued,
      image: undefined,
      categoryId: undefined,

      spicyLevel: 0, // độ cay
      preparationTime: 0, // thời gian chuẩn bị
      popularity: 0, // lượt order món ăn
      dietaryTags: "", // phân loại món ăn
      searchKeywords: "", // từ khóa tìm kiếm
    },
  });
  const image = form.watch("image");
  const name = form.watch("name");
  const previewAvatarFromFile = file ? URL.createObjectURL(file) : image;

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = e.target.files?.[0];
    if (fileFormLocal && !fileFormLocal.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ.", {
        duration: 2000,
      });
    } else {
      toast.success("Ảnh món ăn hợp lệ", {
        duration: 2000,
      });
      setFile(fileFormLocal as File);
    }
  };

  const reset = () => {
    form.reset();
    setFile(null);
  };

  const submit = async (values: CreateDishBodyType) => {
    if (addDishMutation.isPending) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = values;
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
      } = await addDishMutation.mutateAsync(body);

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
    <Dialog
      onOpenChange={(val) => {
        if (!val) {
          reset();
        }
        setOpen(val);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Thêm món ăn</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-300 max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Thêm món ăn</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-dish-form"
            onReset={reset}
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2 items-start justify-start">
                    <Avatar className="aspect-square w-25 h-25 rounded-md object-cover">
                      <AvatarImage src={previewAvatarFromFile} />
                      <AvatarFallback className="rounded-none">{name || "Ảnh món ăn"}</AvatarFallback>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="name">Tên món ăn</Label>
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="price">Giá</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="price"
                            className="w-full"
                            {...field}
                            type="number"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="description">Mô tả món ăn</Label>
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
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="categoryId">Danh mục</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dishCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
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
                              {DishStatusValues.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {getVietnameseDishStatus(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="dietaryTags"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="dietaryTags">Phân loại món ăn</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Textarea id="dietaryTags" className="w-full" {...field} />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preparationTime"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="preparationTime">Thời gian chuẩn bị</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="preparationTime"
                            className="w-full"
                            type="number"
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
                  name="spicyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="spicyLevel">Mức độ cay</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            defaultValue={field.value !== undefined ? String(field.value) : "0"}
                            value={field.value !== undefined ? String(field.value) : "0"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn mức độ cay" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={"0"}>Không cay - 0</SelectItem>
                              <SelectItem value={"1"}>Ít cay - 1</SelectItem>
                              <SelectItem value={"2"}>Vừa cay - 2</SelectItem>
                              <SelectItem value={"3"}>Rất cay - 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="searchKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="searchKeywords">Từ khóa tìm kiếm</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Textarea id="searchKeywords" className="w-full" {...field} />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="reset" form="add-dish-form">
            Xóa
          </Button>
          <Button type="submit" form="add-dish-form" className="bg-blue-500 hover:bg-blue-400 text-white">
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
