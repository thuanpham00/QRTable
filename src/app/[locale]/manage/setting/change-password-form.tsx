"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  ChangePasswordBody,
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import InputPassword from "@/app/[locale]/manage/setting/input-password";
import { useChangePasswordMutation } from "@/queries/useAccount";
import { toast } from "sonner";
import { handleErrorApi, setAccessTokenFromLocalStorage, setRefreshTokenFromLocalStorage } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function ChangePasswordForm() {
  const changePasswordFormMutation = useChangePasswordMutation();
  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const reset = () => {
    form.reset();
  };

  const submit = async (values: ChangePasswordV2BodyType) => {
    if (changePasswordFormMutation.isPending) return;
    try {
      const { payload } = await changePasswordFormMutation.mutateAsync(values);
      setAccessTokenFromLocalStorage(payload.data.accessToken);
      setRefreshTokenFromLocalStorage(payload.data.refreshToken);

      toast.success("Đổi mật khẩu thành công", {
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

  const t = useTranslations("Others");

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
        <Card className="overflow-hidden" x-chunk="dashboard-07-chunk-4">
          <CardHeader>
            <CardTitle>{t("changePasswordTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <InputPassword
                      field={field}
                      label={t("oldPassword") || "Old Password"}
                      controlLabel="oldPassword"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <InputPassword
                      field={field}
                      label={t("newPassword") || "New Password"}
                      controlLabel="password"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <InputPassword
                      field={field}
                      label={t("confirmNewPassword") || "Confirm New Password"}
                      controlLabel="confirmPassword"
                    />
                  </FormItem>
                )}
              />
              <div className=" items-center gap-2 md:ml-auto flex">
                <Button variant="outline" size="sm">
                  {t("cancel")}
                </Button>
                <Button size="sm">{t("save")}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
