/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handleErrorApi } from "@/lib/utils";
import { CreateIngredientBody, CreateIngredientBodyType } from "@/schemaValidations/ingredient.schema";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUploadMutation } from "@/queries/useMedia";
import { useAddIngredientMutation } from "@/queries/useIngredient";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";

export default function AddIngredient() {
  const t = useTranslations("ManageIngredients");
  const uploadMutation = useUploadMutation();
  const addIngredientMutation = useAddIngredientMutation();
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<CreateIngredientBodyType>({
    resolver: zodResolver(CreateIngredientBody),
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

  const submit = async (values: CreateIngredientBodyType) => {
    if (addIngredientMutation.isPending) return;
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
      } = await addIngredientMutation.mutateAsync(body);

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
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{t("createIngredient")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("createIngredient")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-ingredient-form"
            onReset={reset}
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
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">{t("nameIngredient")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="name" className="w-full" {...field} />
                        <FormMessage>
                          {Boolean(errors.name?.message) && t(errors.name?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="category">{t("categoryGroup")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("chooseGroup")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rau-cu">{t("categoryVegetable")}</SelectItem>
                            <SelectItem value="thit-ca">{t("categoryMeat")}</SelectItem>
                            <SelectItem value="gia-vi">{t("categorySpice")}</SelectItem>
                            <SelectItem value="khac">{t("categoryOther")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage>
                          {Boolean(errors.category?.message) && t(errors.category?.message as any)}
                        </FormMessage>
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
                      <Label htmlFor="allergenType">{t("allergenType")}</Label>
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
                      <Label htmlFor="isVegetarian">{t("isVegetarian")}</Label>
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
                      <Label htmlFor="isVegan">{t("isVegan")}</Label>
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
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="description">{t("description2")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Textarea id="description" className="w-full" {...field} />
                        <FormMessage>
                          {Boolean(errors.description?.message) && t(errors.description?.message as any)}
                        </FormMessage>
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
                      <Label htmlFor="isActive">{t("isActive")}</Label>
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
          <Button type="reset" form="add-ingredient-form">
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="add-ingredient-form"
            className="bg-blue-500 hover:bg-blue-400 text-white"
          >
            {t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
