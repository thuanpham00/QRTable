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
import { PanelLeft } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { getMenuItems } from "@/app/[locale]/manage/menuItems";
import { useTranslations } from "next-intl";
import Image from "next/image";

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
      <SheetContent side="left" className="max-w-75 sm:max-w-xs">
        <SheetHeader className="sr-only">
          <SheetTitle />
          <SheetDescription />
        </SheetHeader>
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="group flex shrink-0 items-center justify-start gap-2 p-2 rounded-full text-sm font-semibold md:text-base md:mb-4"
          >
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={128}
              height={128}
              quality={100}
              className="h-9 w-9 md:h-12 md:w-12 object-contain"
            />
            <span className="text-black dark:text-white">QRTable</span>
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
                  <span className="absolute top-[8.5%] left-[6%] w-4 h-4 bg-red-500 rounded-full text-white text-xs text-center block">
                    {countGuestCalls}
                  </span>
                )}
                {isOrderToday && (
                  <span className="absolute top-[16%] left-[6%] w-4 h-4 bg-red-500 rounded-full text-white text-xs text-center block">
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
