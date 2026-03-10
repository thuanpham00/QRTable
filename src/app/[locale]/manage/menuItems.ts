import { Role } from "@/constants/type";
import {
  ShoppingCart,
  Users2,
  Salad,
  Table,
  List,
  Columns3,
  Headset,
  ShoppingBasket,
  DollarSign,
  LayoutDashboard,
  ArrowLeftRight,
  Warehouse,
  Truck,
} from "lucide-react";

export function getMenuItems(t: (key: string) => string) {
  return [
    {
      title: t("dashboard"),
      Icon: LayoutDashboard,
      href: "/manage/dashboard",
      roles: [Role.Owner, Role.Employee],
    },
    {
      title: t("orders"),
      Icon: ShoppingCart,
      href: "/manage/orders",
      roles: [Role.Owner, Role.Employee],
    },
    {
      title: t("payments"),
      Icon: DollarSign,
      href: "/manage/payments",
      roles: [Role.Owner, Role.Employee],
    },
    {
      title: t("callWaiters"),
      Icon: Headset,
      href: "/manage/call-waiters",
      roles: [Role.Owner, Role.Employee],
    },
    {
      title: t("tables"),
      Icon: Table,
      href: "/manage/tables",
      roles: [Role.Owner, Role.Employee],
    },
    {
      title: t("menus"),
      Icon: List,
      href: "/manage/menus",
      roles: [Role.Owner, Role.Employee],
    },
    {
      title: t("categories"),
      Icon: Columns3,
      href: "/manage/categories",
      roles: [Role.Owner],
    },
    {
      title: t("dishes"),
      Icon: Salad,
      href: "/manage/dishes",
      roles: [Role.Owner],
    },
    {
      title: t("ingredients"),
      Icon: ShoppingBasket,
      href: "/manage/ingredients",
      roles: [Role.Owner],
    },
    {
      title: t("supplier"),
      Icon: Truck,
      href: "/manage/suppliers",
      roles: [Role.Owner],
    },
    {
      title: t("import-export"),
      Icon: ArrowLeftRight,
      href: "/manage/import-export-stocks",
      roles: [Role.Owner],
    },
    {
      title: t("inventory-stock"),
      Icon: Warehouse,
      href: "/manage/inventory-stocks",
      roles: [Role.Owner],
    },
    {
      title: t("accounts"),
      Icon: Users2,
      href: "/manage/accounts",
      roles: [Role.Owner],
    },
  ];
}
