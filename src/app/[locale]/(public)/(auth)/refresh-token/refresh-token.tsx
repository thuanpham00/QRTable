"use client";

import { useRouter } from "@/i18n/routing";
import { checkAndRefreshToken, getRefreshTokenFromLocalStorage } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

// dành cho xử lý case lâu ngày không truy cập website: tại middleware khi phát hiện AT hết hạn trong cookie và RT còn hạn
// sẽ redirect sang /refresh-token để refresh AT rồi redirect về trang ban đầu
// tránh việc redirect sang /logout để xóa RT luôn và redirect
export default function RefreshToken() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshTokenFromURL = searchParams.get("refreshToken");
  const redirectFromURL = searchParams.get("redirect");

  useEffect(() => {
    if (refreshTokenFromURL && refreshTokenFromURL === getRefreshTokenFromLocalStorage()) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectFromURL || "/");
        },
      });
    } else {
      router.push("/"); // nếu url ko đúng thì về trang chủ
    }
  }, [refreshTokenFromURL, redirectFromURL, router]);
  return <div>Refresh token page</div>;
}
