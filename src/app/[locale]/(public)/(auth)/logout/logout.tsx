"use client";
import { useAppStore } from "@/components/app-provider";
import { useRouter } from "@/i18n/routing";
import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

// dành cho xử lý case bị lỗi 401 chạy trên server component - case 401 client thì xử lý luôn ở axios interceptor
// sẽ redirect sang /logout để xử lý (xóa token trong LS và xóa token trong cookie) và redirect về /login
export default function Logout() {
  const socket = useAppStore((state) => state.socket);
  const setSocket = useAppStore((state) => state.setSocket);
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);

  const { mutateAsync } = useLogoutMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshTokenFromURL = searchParams.get("refreshToken");
  const accessTokenFromURL = searchParams.get("accessToken");

  useEffect(() => {
    if (
      (refreshTokenFromURL && refreshTokenFromURL === getRefreshTokenFromLocalStorage()) ||
      (accessTokenFromURL && accessTokenFromURL === getAccessTokenFromLocalStorage())
    ) {
      mutateAsync().then(() => {
        router.push("/login");
        setIsRole(undefined);
        setSocket(undefined);
        socket?.disconnect();

        setInfoGuest(undefined);
      });
    } else {
      router.push("/"); // nếu url ko đúng thì về trang chủ
    }
  }, [
    accessTokenFromURL,
    mutateAsync,
    refreshTokenFromURL,
    router,
    socket,
    setIsRole,
    setSocket,
    setInfoGuest,
  ]);
  return <div>Logout page</div>;
}
