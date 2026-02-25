/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAppStore } from "@/components/app-provider";
import { usePathname, useRouter } from "@/i18n/routing";
import { checkAndRefreshToken } from "@/lib/utils";
import { useEffect } from "react";

// component dùng để kiểm tra và refresh token liên tục khi người dùng truy cập các trang private
const UNAUTHORIZED_PATHS = ["/login", "/logout", "/refresh-token"];
export default function RefreshToken() {
  const socket = useAppStore((state) => state.socket);
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setSocket = useAppStore((state) => state.setSocket);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);

  const pathname = usePathname();
  const router = useRouter();
  // bản chất là check access token liên tục để refresh token trước khi nó hết hạn.
  useEffect(() => {
    if (UNAUTHORIZED_PATHS.includes(pathname)) return;
    let interval: any = null;

    const onRefreshToken = (force?: boolean) =>
      checkAndRefreshToken({
        onError: () => {
          clearInterval(interval); // dừng ngay lập tức interval đó, không cần component phải unmount.
          router.push("/login");
          setIsRole(undefined);
          setSocket(undefined);
          socket?.disconnect();

          setInfoGuest(undefined);
        },
        force,
      });

    // Phải gọi lần đầu tiên, vì interval sẽ chạy sau thời gian TIMEOUT
    onRefreshToken();

    const TIMEOUT = 1000;
    interval = setInterval(onRefreshToken, TIMEOUT);

    if (socket?.connected) {
      onConnect();
    }

    function onConnect() {
      console.log(socket?.id);
    }

    function onDisconnect() {
      console.log("disconnected");
    }

    function onRefreshTokenSocket() {
      onRefreshToken(true);
    }

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("refresh-token", onRefreshTokenSocket); // làm mới token khi có sự thay đổi role account từ server - để từ đó dùng TOken mới có thể lấy được role mới

    return () => {
      clearInterval(interval);
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("refresh-token", onRefreshTokenSocket);
    };
  }, [pathname, router, setIsRole, socket, setSocket, setInfoGuest]);

  return null;
}
