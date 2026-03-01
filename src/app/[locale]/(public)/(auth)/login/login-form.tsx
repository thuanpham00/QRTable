"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/queries/useAuth";
import { toast } from "sonner";
import { generateSocket, handleErrorApi } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/components/app-provider";
import { envConfig } from "@/utils/config";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import SearchParamsLoader, { useSearchParamsLoader } from "@/components/search-params-loader";

const getOauthGoogleUrl = () => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: envConfig.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
    client_id: envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};
const googleOauthUrl = getOauthGoogleUrl();

export default function LoginForm() {
  /**
   *  1. Client component gọi api login route handler là `/auth/login`
      2. Route handler này sẽ gọi tiếp api login đến Server Backend để nhận về token, sau đó lưu token vào cookie client, cuối cùng trả kết quả về cho client component
      Gọi là dùng `Next.js Server` làm `proxy trung gian`
   */
  const t = useTranslations("Login");
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setSocket = useAppStore((state) => state.setSocket);

  const { searchParams, setSearchParams } = useSearchParamsLoader();
  const clearTokens = searchParams?.get("clearTokens");

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submit = async (data: LoginBodyType) => {
    if (loginMutation.isPending) return;
    try {
      const result = await loginMutation.mutateAsync(data);
      toast.success(t("loginSuccess"), {
        duration: 2000,
      });
      router.push("/manage/dashboard");
      setIsRole(result.payload.data.account.role);
      setSocket(generateSocket(result.payload.data.accessToken)); // khởi tạo socket khi login thành công
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  useEffect(() => {
    if (clearTokens) {
      setIsRole(undefined);
    }
  }, [clearTokens, setIsRole]);

  return (
    <Card className="mx-auto md:max-w-md w-full mt-16">
      <SearchParamsLoader onParamsReceived={setSearchParams} />

      <CardHeader>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-2 shrink-0 w-full"
            noValidate
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="m@example.com" required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} required {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t("buttonLogin")}
              </Button>
              <Link
                href={googleOauthUrl}
                className="mt-2 border border-black/80 dark:border-white rounded-md w-full mx-auto p-2 flex items-center justify-center gap-2"
              >
                <div
                  className="w-5 h-5"
                  style={{
                    backgroundImage: `url("https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg")`,
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                  }}
                ></div>
                <span className="text-sm font-semibold">{t("loginWithGoogle")}</span>
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// để fix lỗi useSearchParams từ nextjs thì dùng suspense bao ngoài
// export default function LoginForm() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <Login />
//     </Suspense>
//   );
// }

// nếu dùng useSearchParams (dùng Suspense bọc component) thì sẽ bị
// tình trạng là bên ngoài static bên trong dynamic vì Suspense chặn static không render html hết page - cách cũ

// cách mới là ko dùng Suspense nữa dùng hook SearchParamsLoader thì lúc này sẽ render được hết page - full html
