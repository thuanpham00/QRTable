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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpdateEmployeeAccountBody, UpdateEmployeeAccountBodyType } from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useGetEmployeeDetailQuery, useUpdateEmployeeMutation } from "@/queries/useAccount";
import { toast } from "sonner";
import { useUploadMutation } from "@/queries/useMedia";
import { handleErrorApi } from "@/lib/utils";
import InputPassword from "@/app/[locale]/manage/setting/input-password";
import { Role, RoleValues } from "@/constants/type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export default function EditEmployee({
  id,
  setId,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
}) {
  const t = useTranslations("ManageAccounts");

  const accountDetail = useGetEmployeeDetailQuery({ id: id as number, enabled: Boolean(id) });
  const dataAccountDetail = accountDetail.data?.payload.data;

  const uploadMutation = useUploadMutation();
  const updateEmployeeMutation = useUpdateEmployeeMutation();

  const [file, setFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<UpdateEmployeeAccountBodyType>({
    resolver: zodResolver(UpdateEmployeeAccountBody),
    defaultValues: {
      name: "",
      email: "",
      avatar: undefined,
      changePassword: false,
      password: undefined, // changePassword true thì mới validate mấy trường này và trường này khởi tạo undefined -> "" sẽ báo lỗi zod
      confirmPassword: undefined, // changePassword true thì mới validate mấy trường này và trường này khởi tạo undefined -> "" sẽ báo lỗi zod
      role: Role.Employee,
    },
  });

  const avatar = form.watch("avatar");
  const name = form.watch("name");
  const changePassword = form.watch("changePassword");
  const previewAvatarFromFile = file ? URL.createObjectURL(file) : avatar;

  useEffect(() => {
    if (dataAccountDetail) {
      form.reset({
        name: dataAccountDetail.name,
        email: dataAccountDetail.email,
        avatar: dataAccountDetail.avatar ?? undefined,
        changePassword: form.getValues("changePassword"), // lấy giá trị khởi tạo
        password: form.getValues("password"),
        confirmPassword: form.getValues("confirmPassword"),
        role: dataAccountDetail.role,
      });
    }
  }, [dataAccountDetail, form]);

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

  const submit = async (values: UpdateEmployeeAccountBodyType) => {
    if (updateEmployeeMutation.isPending) return;
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
      } = await updateEmployeeMutation.mutateAsync({
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
          <DialogTitle>{t("editAccount")}</DialogTitle>
          <DialogDescription>{t("descriptionEdit")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-employee-form"
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
                    <div className="grid gap-2">
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
                    <div className="grid gap-2">
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
                name="role"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="role">{t("role")}</Label>
                      <div className="w-full">
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {RoleValues.map((category) => {
                              if (category === Role.Guest) return null;
                              return (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage>
                          {Boolean(errors.role?.message) && t(errors.role?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="changePassword"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="email" className="shrink-0">
                        {t("changePassword")}
                      </Label>
                      <div className="ml-1">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <FormMessage>
                          {Boolean(errors.changePassword?.message) &&
                            t(errors.changePassword?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              {changePassword && (
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
              )}
              {changePassword && (
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
              )}
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-employee-form">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
