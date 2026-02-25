/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getVietnameseDishStatus, handleErrorApi } from "@/lib/utils";
import { UpdateDishBody, UpdateDishBodyType } from "@/schemaValidations/dish.schema";
import { DishStatus, DishStatusValues } from "@/constants/type";
import { Textarea } from "@/components/ui/textarea";
import { useUploadMutation } from "@/queries/useMedia";
import { useDeleteDishMutation, useGetDishDetailQuery, useUpdateDishMutation } from "@/queries/useDish";
import { toast } from "sonner";
import { useGetListDishCategoryNameQuery } from "@/queries/useDishCategory";
import { useRouter } from "@/i18n/routing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select as SelectAntd } from "antd";

export default function FormEditDish({ idDish }: { idDish?: number | undefined }) {
  const dishDetail = useGetDishDetailQuery({ id: idDish as number, enabled: Boolean(idDish) });
  const dataDishDetail = dishDetail.data?.payload.data;
  const listNameDishCategory = useGetListDishCategoryNameQuery();
  const dishCategories = listNameDishCategory.data?.payload.data || [];

  const uploadMutation = useUploadMutation();
  const updateDishMutation = useUpdateDishMutation();

  const [file, setFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<UpdateDishBodyType>({
    resolver: zodResolver(UpdateDishBody),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: undefined,

      status: DishStatus.Discontinued,
      categoryId: "",
      spicyLevel: 0,

      dietaryTags: "",
      preparationTime: 0,
      searchKeywords: "",
      popularity: 0,
    },
  });

  const image = form.watch("image");
  const name = form.watch("name");

  const previewAvatarFromFile = file ? URL.createObjectURL(file) : image;

  useEffect(() => {
    if (dataDishDetail) {
      form.reset({
        name: dataDishDetail.name,
        description: dataDishDetail.description,
        price: dataDishDetail.price,
        image: dataDishDetail.image,
        status: dataDishDetail.status,
        categoryId: dataDishDetail?.categoryId.toString(),

        dietaryTags: dataDishDetail.dietaryTags || "",
        spicyLevel: dataDishDetail.spicyLevel,
        preparationTime: dataDishDetail.preparationTime,
        searchKeywords: dataDishDetail.searchKeywords,
        popularity: dataDishDetail.popularity,
      });
    }
  }, [dataDishDetail, dishCategories, form]);

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

  const submit = async (values: UpdateDishBodyType) => {
    if (updateDishMutation.isPending) return;
    let body = values;
    console.log(values);
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
        payload: { message, data },
      } = await updateDishMutation.mutateAsync({
        id: idDish as number,
        body: body,
      });
      form.reset({
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        status: data.status,
        categoryId: data.categoryId.toString(),
        dietaryTags: data.dietaryTags || "",
        spicyLevel: data.spicyLevel,
        preparationTime: data.preparationTime,
        searchKeywords: data.searchKeywords,
        popularity: data.popularity,
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
    form.reset();
  };

  const [openDialog, setOpenDialog] = useState(false);
  const deleteDishMutation = useDeleteDishMutation();
  const router = useRouter();

  const handleDeleteDish = async () => {
    if (idDish) {
      try {
        const {
          payload: { message },
        } = await deleteDishMutation.mutateAsync(idDish);
        toast.success(message, {
          duration: 2000,
        });
        setOpenDialog(false);
        router.push("/manage/dishes");
      } catch (error) {
        handleErrorApi({ errors: error });
      }
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          noValidate
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="edit-dish-form"
          onSubmit={form.handleSubmit(submit, (err) => {
            console.log(err);
          })}
          onReset={reset}
        >
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-2 items-start justify-start">
                  <Avatar className="aspect-square w-84 h-70 rounded-md object-cover">
                    <AvatarImage src={previewAvatarFromFile} />
                    <AvatarFallback className="rounded-none">{name || "Avatar"}</AvatarFallback>
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
                      <Label htmlFor="description">Mô tả sản phẩm</Label>
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
                        <SelectAntd
                          className="dark:bg-[#212121]! dark:border-gray-600! dark:text-white!"
                          value={field.value}
                          style={{ width: 120 }}
                          onChange={(value) => field.onChange(value)}
                          options={[
                            ...dishCategories.map((category) => ({
                              label: category.name,
                              value: category.id.toString(),
                            })),
                          ]}
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
                      <Label htmlFor="description">Trạng thái</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <SelectAntd
                          className="dark:bg-[#212121]! dark:border-gray-600! dark:text-white! w-40!"
                          value={field.value}
                          style={{ width: 120 }}
                          onChange={(value) => field.onChange(value)}
                          options={[
                            ...DishStatusValues.map((status) => ({
                              label: getVietnameseDishStatus(status),
                              value: status,
                            })),
                          ]}
                        />
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
                        <SelectAntd
                          className="dark:bg-[#212121]! dark:border-gray-600! dark:text-white! w-40!"
                          value={field.value !== undefined ? String(field.value) : ""}
                          style={{ width: 120 }}
                          onChange={(value) => field.onChange(Number(value))}
                          options={[
                            {
                              label: "Không cay - 0",
                              value: "0",
                            },
                            {
                              label: "Ít cay - 1",
                              value: "1",
                            },
                            {
                              label: "Cay vừa - 2",
                              value: "2",
                            },
                            {
                              label: "Rất cay - 3",
                              value: "3",
                            },
                          ]}
                        />
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

          <div className="flex items-center justify-end gap-2">
            <Button variant="destructive" type="button" onClick={() => setOpenDialog(true)}>
              Xóa món ăn
            </Button>
            <Button type="reset" form="edit-dish-form">
              Hủy
            </Button>
            <Button type="submit" form="edit-dish-form" className="bg-blue-500 hover:bg-blue-400 text-white">
              Cập nhật
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa món ăn?</AlertDialogTitle>
            <AlertDialogDescription>
              Món ăn sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDish}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
