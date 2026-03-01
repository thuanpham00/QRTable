"use client";
import { useAppStore } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Package2, PanelLeft } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { getMenuItems } from "@/app/[locale]/manage/menuItems";
import { useTranslations } from "next-intl";

export default function MobileNavLinks() {
  const pathname = usePathname();
  const isRole = useAppStore((state) => state.isRole);
  const countGuestCalls = useAppStore((state) => state.countGuestCalls);
  const countOrderToday = useAppStore((state) => state.countOrderToday);
  const t = useTranslations("NavItemManage");
  const menuItems = getMenuItems(t);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <SheetHeader className="sr-only">
          <SheetTitle />
          <SheetDescription />
        </SheetHeader>
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="#"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          {menuItems.map((Item, index) => {
            if (!Item.roles.includes(isRole as "Owner" | "Employee")) return null;
            const isActive = pathname.includes(Item.href);
            const isCallGuest = Item.href === "/manage/call-waiters";
            const isOrderToday = Item.href === "/manage/orders";
            return (
              <Link
                key={index}
                href={Item.href}
                className={cn("flex items-center gap-4 px-2.5  hover:text-foreground", {
                  "text-foreground": isActive,
                  "text-muted-foreground": !isActive,
                })}
              >
                {isCallGuest && (
                  <span className="absolute top-0 left-7.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs text-center block">
                    {countGuestCalls}
                  </span>
                )}
                {isOrderToday && (
                  <span className="absolute top-0 left-7.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs text-center block">
                    {countOrderToday}
                  </span>
                )}
                <Item.Icon className="h-5 w-5" />
                {Item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
