/* eslint-disable @typescript-eslint/no-explicit-any */
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateEmployeeAccountBody, CreateEmployeeAccountBodyType } from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InputPassword from "@/app/[locale]/manage/setting/input-password";
import { useUploadMutation } from "@/queries/useMedia";
import { toast } from "sonner";
import { useAddEmployeeMutation } from "@/queries/useAccount";
import { handleErrorApi } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function AddEmployee() {
  const uploadMutation = useUploadMutation();
  const addEmployeeMutation = useAddEmployeeMutation();
  const t = useTranslations("ManageAccounts");
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<CreateEmployeeAccountBodyType>({
    resolver: zodResolver(CreateEmployeeAccountBody),
    defaultValues: {
      name: "",
      email: "",
      avatar: undefined,
      password: "", // undefined convert thành "" sẽ báo lỗi zod
      confirmPassword: "", // undefined convert thành "" sẽ báo lỗi zod
    },
  });
  const avatar = form.watch("avatar");
  const name = form.watch("name");
  const previewAvatarFromFile = file ? URL.createObjectURL(file) : avatar;

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = e.target.files?.[0];
    if (fileFormLocal && !fileFormLocal.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ.", {
        duration: 2000,
      });
    } else {
      toast.success("Avatar hợp lệ", {
        duration: 2000,
      });
      setFile(fileFormLocal as File);
    }
  };

  const reset = () => {
    form.reset();
    setFile(null);
  };

  const submit = async (values: CreateEmployeeAccountBodyType) => {
    if (addEmployeeMutation.isPending) return;
    let body = values;
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const { payload } = await uploadMutation.mutateAsync(formData);
        const urlAvatar = payload.data;
        body = {
          ...values,
          avatar: urlAvatar,
        };
      }
      const {
        payload: { message },
      } = await addEmployeeMutation.mutateAsync(body);
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
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
        setOpen(value);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{t("createAccount")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("createAccount")}</DialogTitle>
          <DialogDescription>{t("descriptionCreate")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-employee-form"
            onReset={reset}
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-25 h-25 rounded-md object-cover">
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className="rounded-none">{name || "Avatar"}</AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          handleChangeFile(e);
                          field.onChange("http://localhost:3000/" + field.name);
                        }}
                        className="hidden"
                      />
                      <button
                        className="flex aspect-square w-25 items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid  gap-2">
                      <Label htmlFor="name">{t("name")}</Label>
                      <Input id="name" className="w-full" {...field} />
                      <FormMessage>
                        {Boolean(errors.name?.message) && t(errors.name?.message as any)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid  gap-2">
                      <Label htmlFor="email">{t("email")}</Label>
                      <Input id="email" className="w-full" {...field} />
                      <FormMessage>
                        {errors.email?.message &&
                          (errors.email.type === "server"
                            ? t("emailExisted") // Lỗi từ server → dịch key
                            : t(errors.email.message as any))}{" "}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <InputPassword
                      field={field}
                      label={t("password")}
                      controlLabel="password"
                      nameI18="ManageAccounts"
                      fieldError={errors.password?.message}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <InputPassword
                      field={field}
                      label={t("confirmPassword")}
                      controlLabel="confirmPassword"
                      nameI18="ManageAccounts"
                      fieldError={errors.confirmPassword?.message}
                    />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="reset" form="add-employee-form">
            {t("cancel")}
          </Button>
          <Button type="submit" form="add-employee-form" className="bg-blue-500 hover:bg-blue-400 text-white">
            {t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
