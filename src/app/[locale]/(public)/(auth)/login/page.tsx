import LoginForm from "@/app/[locale]/(public)/(auth)/login/login-form";
import bgLogin from "../../../../../../public/images/restaurant.png";
import { setRequestLocale } from "next-intl/server";

export default async function Login({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale);
  return (
    <div className="relative">
      <div
        style={{
          backgroundImage: `url(${bgLogin.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "calc(100vh - 64px)",
          filter: "brightness(0.7)",
        }}
        className="absolute z-1 inset-0"
      ></div>
      <div className="absolute z-2 inset-0 mx-4">
        <LoginForm />
      </div>
    </div>
  );
}
