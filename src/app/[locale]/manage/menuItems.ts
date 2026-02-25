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
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    Icon: LayoutDashboard,
    href: "/manage/dashboard",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Đơn hàng",
    Icon: ShoppingCart,
    href: "/manage/orders",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Thanh toán",
    Icon: DollarSign,
    href: "/manage/payments",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Gọi phục vụ",
    Icon: Headset,
    href: "/manage/call-waiters",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Bàn ăn",
    Icon: Table,
    href: "/manage/tables",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Menu món ăn",
    Icon: List,
    href: "/manage/menus",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Danh mục món",
    Icon: Columns3,
    href: "/manage/categories",
    roles: [Role.Owner],
  },
  {
    title: "Món ăn",
    Icon: Salad,
    href: "/manage/dishes",
    roles: [Role.Owner],
  },
  {
    title: "Nguyên liệu",
    Icon: ShoppingBasket,
    href: "/manage/ingredients",
    roles: [Role.Owner],
  },
  {
    title: "Nhân viên",
    Icon: Users2,
    href: "/manage/accounts",
    roles: [Role.Owner],
  },
];

export default menuItems;
