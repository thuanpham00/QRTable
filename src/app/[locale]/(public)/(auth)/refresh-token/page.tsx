import RefreshToken from "@/app/[locale]/(public)/(auth)/refresh-token/refresh-token";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Refresh token redirect",
  description: "Refresh token redirect",
  robots: {
    index: false, // chặn trạng này không được index bởi công cụ tìm kiếm (là google không index trang này vào kết quả tìm kiếm)
  },
};

export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RefreshToken />
    </Suspense>
  );
}
