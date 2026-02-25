"use client";
import { useAppStore } from "@/components/app-provider";
import { usePathname, useRouter } from "@/i18n/routing";
import { handleErrorApi } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useEffect } from "react";

// tự động logout khi tài khoản bị xóa
const UNAUTHORIZED_PATHS = ["/login", "/logout", "/refresh-token"];
export default function LogoutSocket() {
  const socket = useAppStore((state) => state.socket);
  const setSocket = useAppStore((state) => state.setSocket);
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);

  const logoutMutation = useLogoutMutation();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (UNAUTHORIZED_PATHS.includes(pathname)) return;

    async function onLogout() {
      if (logoutMutation.isPending) return;
      try {
        await logoutMutation.mutateAsync();
        router.push("/");
        setIsRole(undefined);
        setSocket(undefined);
        socket?.disconnect();

        setInfoGuest(undefined);
      } catch (error) {
        handleErrorApi({
          errors: error,
        });
      }
    }

    socket?.on("logout", onLogout);
    socket?.on("force-logout", onLogout);

    return () => {
      socket?.off("logout", onLogout);
      socket?.off("force-logout", onLogout);
    };
  }, [pathname, router, socket, logoutMutation, setIsRole, setSocket, setInfoGuest]);

  return null;
}
