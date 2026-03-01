import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-linear-to-br from-gray-900 via-[#18181b] to-gray-950 py-14 px-6 sm:px-8 lg:px-33.75 shadow-inner">
      <div className="grid md:grid-cols-[1.2fr_1fr_1fr] gap-12 justify-items-start md:justify-items-start text-left md:text-left items-start">
        <div className="flex flex-col items-start self-start">
          <div className="flex items-center justify-start gap-2 mb-5">
            <div className="w-14 h-12">
              <Image src={"/images/logo.png"} alt="Logo" className="w-20 h-14" width={50} height={50} />
            </div>
            <span className="text-white text-lg font-bold text-center -tracking-tighter">{t("brand")}</span>
          </div>
          <p className="text-white leading-relaxed max-w-[320px] mb-4">{t("slogan")}</p>
        </div>
        <div className="self-start">
          <h3 className="text-white text-xl font-semibold mb-6 tracking-wide">{t("quickLinks")}</h3>
          <ul className="space-y-3 text-white/80 font-medium">
            {[
              { name: t("home"), to: "/" },
              { name: t("menu"), to: "/menu" },
              { name: t("about"), to: "/about" },
              { name: t("privacyPolicy"), to: "/privacy-policy" },
              { name: t("termOfService"), to: "/term-of-service" },
            ].map((item, idx) => (
              <li key={idx}>
                <Link
                  href={item.to}
                  className="hover:text-orange-400 hover:underline underline-offset-4 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="self-start">
          <h3 className="text-white text-xl font-semibold mb-6 tracking-wide">{t("contact")}</h3>
          <ul className="space-y-3 text-white/80 text-base">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400">{t("email")}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-400" />
              <span>{t("phone")}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-orange-400/70 mr-1" />
              <span>{t("address")}</span>
            </li>
          </ul>
          <div className="h-px bg-white/20 my-6"></div>
          <p className="text-white/60 text-sm">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
