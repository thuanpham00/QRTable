"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/routing";
import { useLogoutMutation } from "@/queries/useAuth";
import { handleErrorApi } from "@/lib/utils";
import { useGetMeQuery } from "@/queries/useAccount";
import { useAppStore } from "@/components/app-provider";

// những trang cần login thì ko cần seo nên cứ gọi api ở client thoải mái
export default function DropdownAvatar() {
  const socket = useAppStore((state) => state.socket);
  const setSocket = useAppStore((state) => state.setSocket);
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);

  const logoutMutation = useLogoutMutation();

  const { data } = useGetMeQuery({
    queryKey: "profile-me",
  });
  const account = data?.payload.data;

  const router = useRouter();

  const logout = async () => {
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
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <Avatar>
            <AvatarImage src={account?.avatar ?? undefined} alt={account?.name ?? ""} />
            <AvatarFallback>{account?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{account?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={"/manage/setting"} className="cursor-pointer">
            Cài đặt
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
