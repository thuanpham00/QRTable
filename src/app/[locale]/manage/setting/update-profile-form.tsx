/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { UpdateMeBody, UpdateMeBodyType } from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGetMeQuery, useUpdateMeMutation } from "@/queries/useAccount";
import { useUploadMutation } from "@/queries/useMedia";
import { useQueryClient } from "@tanstack/react-query";
import { handleErrorApi } from "@/lib/utils";

export default function UpdateProfileForm() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data } = useGetMeQuery({
    queryKey: "profile-me",
  });
  const updateMeFormMutation = useUpdateMeMutation();
  const uploadMutation = useUploadMutation();

  const [file, setFile] = useState<File | null>(null);
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: "",
      avatar: undefined,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.payload.data.name,
        avatar: data.payload.data.avatar ?? undefined,
      });
    }
  }, [data, form]);

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

  const nameForm = form.watch("name");
  const avatarForm = form.watch("avatar");
  const avatarPreview = file ? URL.createObjectURL(file) : avatarForm;

  const reset = () => {
    setFile(null);
    form.reset(); // quay lại giá trị từ defaultValues hoặc giá trị đã load
  };

  const submit = async (values: UpdateMeBodyType) => {
    if (updateMeFormMutation.isPending) return;
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
      await updateMeFormMutation.mutateAsync(body);
      toast.success("Cập nhật thông tin thành công", {
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["profile-me"] });
      /**
       * Nếu cùng queryKey → invalidate/refetch = 1 request, share cho tất cả component.
         Nếu khác queryKey → mỗi query là 1 request riêng, invalidate cũng chỉ tác động đúng queryKey bạn chọn.
       */
      setFile(null);
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onReset={reset}
        onSubmit={form.handleSubmit(submit, (err) => {
          console.log(err);
        })}
      >
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-25 h-25 rounded-md object-cover">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback className="rounded-none">{nameForm}</AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={inputRef}
                        onClick={(e) => {
                          (e.target as any).value = null;
                        }}
                        onChange={(e) => {
                          handleChangeFile(e);
                          field.onChange("http://localhost:3000/", field.name); // skip validate zod
                        }}
                      />
                      <button
                        className="flex aspect-square w-25 items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => inputRef.current?.click()}
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
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="name">Tên</Label>
                      <Input id="name" type="text" className="w-full" {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className=" items-center gap-2 md:ml-auto flex">
                <Button variant="outline" size="sm" type="reset">
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
