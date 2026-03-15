"use client";
import { useAppStore } from "@/components/app-provider";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { RoleType } from "@/types/jwt.types";
import { decodeToken, generateSocket } from "@/lib/utils";
import { toast } from "sonner";
import { useLoginOauthMutation } from "@/queries/useAuth";
import { useRouter } from "@/i18n/routing";

function OauthForm() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setSocket = useAppStore((state) => state.setSocket);

  const { mutateAsync } = useLoginOauthMutation();

  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const message = searchParams.get("message");
  const refFlag = useRef(true);

  useEffect(() => {
    if (refFlag.current === false) return;
    refFlag.current = false;

    if (accessToken && refreshToken) {
      const { role } = decodeToken(refreshToken) as { role: RoleType };
      mutateAsync({ accessToken, refreshToken }).then(() => {
        setIsRole(role);
        setSocket(generateSocket(accessToken));
        router.push("/manage/dashboard");
      });
    } else {
      setTimeout(() => {
        toast.error(message || "Đăng nhập không thành công, vui lòng thử lại sau", { duration: 2000 });
      }, 500);
      router.push("/login");
    }
  }, [accessToken, refreshToken, message, setIsRole, setSocket, router, mutateAsync]);

  return null;
}

// để fix lỗi useSearchParams từ nextjs thì dùng suspense bao ngoài
export default function OauthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OauthForm />
    </Suspense>
  );
}
