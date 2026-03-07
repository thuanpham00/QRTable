import Logout from "@/app/[locale]/(public)/(auth)/logout/logout";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Logout redirect",
  description: "Logout redirect",
  robots: {
    index: false, // chặn trạng này không được index bởi công cụ tìm kiếm (là google không index trang này vào kết quả tìm kiếm)
  },
};

// để fix lỗi useSearchParams từ nextjs thì dùng suspense bao ngoài
export default function LogoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Logout />
    </Suspense>
  );
}
