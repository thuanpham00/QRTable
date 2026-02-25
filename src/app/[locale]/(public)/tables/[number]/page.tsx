import GuestLoginForm from "@/app/[locale]/(public)/tables/[number]/guest-login-form";
import bgLogin from "../../../../../../public/images/restaurant.png";

export default function TableNumberPage() {
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
      <div className="absolute z-2 inset-0 top-20">
        <GuestLoginForm />
      </div>
    </div>
  );
}
