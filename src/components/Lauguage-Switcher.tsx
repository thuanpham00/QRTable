"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import coVN from "../../public/images/co-vn.png";
import coMy from "../../public/images/co-my.png";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const t = useTranslations("SwitchLanguage");
  const locale = useLocale();
  const pathName = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild defaultValue={locale}>
        <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
          {locale === "vi" ? (
            <Image src={coVN} alt="Vietnamese" width={24} height={24} className="object-contain" />
          ) : (
            <Image src={coMy} alt="English" width={24} height={24} className="object-contain" />
          )}
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            const locale = params.locale;
            const newUrl = pathName.replace(`${locale}`, "vi"); // thay thế phần locale trong path bằng giá trị mới = /en/login -> /vi/login
            const fullNewUrl = newUrl + (searchParams ? `?${searchParams.toString()}` : "");
            router.replace(fullNewUrl);
          }}
        >
          <span>{t("vi")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const locale = params.locale;
            const newUrl = pathName.replace(`${locale}`, "en"); // thay thế phần locale trong path bằng giá trị mới = /vi/login -> /en/login
            const fullNewUrl = newUrl + (searchParams ? `?${searchParams.toString()}` : "");
            router.replace(fullNewUrl);
          }}
        >
          <span>{t("en")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
