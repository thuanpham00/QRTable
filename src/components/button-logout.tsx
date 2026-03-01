"use client";
import { useAppStore } from "@/components/app-provider";
import { Role } from "@/constants/type";
import { handleErrorApi } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useGuestLogoutMutation } from "@/queries/useGuest";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function ButtonLogout() {
  const t = useTranslations("Others");
  const socket = useAppStore((state) => state.socket);
  const setSocket = useAppStore((state) => state.setSocket);
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);

  const isAuth = useAppStore((state) => state.isAuth);
  const isRole = useAppStore((state) => state.isRole);

  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  const logoutGuestMutation = useGuestLogoutMutation();

  if (!isAuth) return null;

  const checkRole = () => {
    return isRole === Role.Guest ? logoutGuestMutation : logoutMutation;
  };

  const logout = async () => {
    if (logoutMutation.isPending) return;
    try {
      await checkRole().mutateAsync();
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
  };

  return (
    <button onClick={logout} className="cursor-pointer">
      {t("logout")}
    </button>
  );
}
