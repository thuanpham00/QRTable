"use client";
import { useAppStore } from "@/components/app-provider";
import { Role } from "@/constants/type";
import { RoleType } from "@/types/jwt.types";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// server: trả về món ăn + đăng nhập do server ko biết trạng thái login
// client: đầu tiên client sẽ hiển thị món ăn + đăng nhập
// nhưng sau đó thì client render ra là món ăn + đơn hàng + quản lý do đã check được trạng thái login
// 'Text content does not match server-rendered HTML' - do sự khác biệt giữa server và client -> dùng state (chớp giật ui)

// hoặc là chuyển nav-items thành server component (cookie - mất static) sẽ không bị chớp giật UI

export default function NavItems({ className }: { className?: string }) {
  const t = useTranslations("NavItem");
  const isAuth = useAppStore((state) => state.isAuth);
  const isRole = useAppStore((state) => state.isRole);
  const pathname = usePathname();
  // nếu check login ở server thì chỉ check bằng cookies() nhưng cookies() thì page sẽ thành dynamic function
  // dẫn đến các trang thành dynamic page hết
  // nếu là tránh việc này check ở client bằng localStorage như trên và chỉ chạy đoạn này ở client nếu chạy ở server thì null (dành cho build page)
  // nó sẽ tránh được việc page thành dynamic page -> static page vẫn ok

  const menuItems = [
    {
      title: t("home"),
      href: "/",
      roles: [Role.Guest, Role.Employee, Role.Owner], // ko yêu cầu login và 3 role đều xem được
    },
    {
      title: t("menu"),
      href: "/menu",
      roles: [Role.Guest, Role.Employee, Role.Owner], // ko yêu cầu login và 3 role đều xem được
    },
    {
      title: t("orders"),
      href: "/guest/orders",
      authRequired: true,
      roles: [Role.Guest], // ko yêu cầu login và chỉ role khách xem được
    },
    {
      title: t("guestMenu"),
      href: "/guest/menu",
      authRequired: true,
      roles: [Role.Guest], // ko yêu cầu login và chỉ role khách xem được
    },
    {
      title: t("login"),
      href: "/login",
      authRequired: false,
      roles: [Role.Guest, Role.Employee, Role.Owner], // ko yêu cầu login và 3 role đều xem được
    },
    {
      title: t("manage"),
      href: "/manage/dashboard",
      authRequired: true,
      roles: [Role.Employee, Role.Owner], // yêu cầu login và dành cho nhân viên và quản trị viên
    },
  ];

  const checkRole = (role: RoleType | undefined) => {
    if (!role) {
      return menuItems;
    }
    return menuItems.filter((item) => item.roles.includes(role as RoleType));
  };

  return checkRole(isRole).map((item) => {
    if ((item.authRequired === false && isAuth) || (item.authRequired === true && !isAuth)) return null;
    return (
      <Link
        href={item.href}
        key={item.href}
        className={cn(className, pathname === item.href ? "dark:text-white text-black" : "dark:text-muted-foreground text-gray-500")}
      >
        {item.title}
      </Link>
    );
  });
}
