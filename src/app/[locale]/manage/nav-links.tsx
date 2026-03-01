"use client";
import { useAppStore } from "@/components/app-provider";
import { Tooltip, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/routing";
import { getMenuItems } from "@/app/[locale]/manage/menuItems";
import { useTranslations } from "next-intl";

export default function NavLinks() {
  const pathname = usePathname();
  const isRole = useAppStore((state) => state.isRole);
  const countGuestCalls = useAppStore((state) => state.countGuestCalls);
  const countOrderToday = useAppStore((state) => state.countOrderToday);
  const t = useTranslations("NavItemManage");
  const menuItems = getMenuItems(t);

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden sm:w-50 border-r bg-background sm:flex flex-col">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Link
            href="/"
            className="group flex shrink-0 items-center justify-center gap-2 p-2 rounded-full text-sm font-semibold md:text-base md:mb-4"
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
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={Item.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-start gap-2 p-2 pl-4 rounded-lg transition-colors hover:text-foreground md:h-8 md:w-full relative",
                      {
                        "bg-accent text-accent-foreground": isActive,
                        "text-muted-foreground": !isActive,
                      },
                    )}
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
                    <div>{Item.title}</div>
                    <span className="sr-only">{Item.title}</span>
                  </Link>
                </TooltipTrigger>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
