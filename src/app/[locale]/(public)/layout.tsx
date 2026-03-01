import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import DarkModeToggle from "@/components/dark-mode-toggle";
import Image from "next/image";
import ButtonLogout from "@/components/button-logout";
import React from "react";
import Footer from "@/components/footer";
import NavItems from "@/app/[locale]/(public)/nav-items";
import LanguageSwitcher from "@/components/Lauguage-Switcher";
import { setRequestLocale } from "next-intl/server";

export default async function Layout({
  children,
  modal,
  params,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const locale = (await params).locale;
  setRequestLocale(locale); // Thiết lập locale cho request hiện tại - Đặt ngôn ngữ cho toàn bộ Server Components trong request đó - chỉ dùng dc cho server component 

  return (
    <div className="flex min-h-screen w-full flex-col relative">
      <header className="sticky top-0 flex h-16 z-30 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <div className="flex items-center gap-2 text-lg font-semibold md:text-base mr-4">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={128}
              height={128}
              quality={100}
              className="h-10 w-10 object-contain "
            />
            <span className="">QRTable</span>
          </div>
          <NavItems className="transition-colors hover:text-foreground shrink-0 text-black dark:text-white" />
        </nav>

        {/* navbar dành cho mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader className="sr-only">
              <SheetTitle />
              <SheetDescription />
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium p-6">
              <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={128}
                  height={128}
                  quality={100}
                  className="h-10 w-10 object-contain "
                />
                <span>QRTable</span>
              </div>

              <NavItems className="text-muted-foreground transition-colors hover:text-foreground" />
            </nav>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center gap-4">
          <LanguageSwitcher />
          <DarkModeToggle />
          <ButtonLogout />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        {children}
        {modal}
      </main>
      <Footer />
    </div>
  );
}
