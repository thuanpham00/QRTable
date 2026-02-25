import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

const Footer = () => (
  <footer className="bg-linear-to-br from-gray-900 via-[#18181b] to-gray-950 py-14 px-6 sm:px-8 lg:px-33.75 shadow-inner">
    <div className="grid md:grid-cols-[1.2fr_1fr_1fr] gap-12 justify-items-start md:justify-items-start text-left md:text-left items-start">
      <div className="flex flex-col items-start self-start">
        <div className="flex items-center justify-start gap-2 mb-5">
          <div className="w-14 h-12">
            <Image src={"/images/logo.png"} alt="Logo" className="w-20 h-14" width={50} height={50} />
          </div>
          <span className="text-white text-lg font-bold text-center -tracking-tighter">Restaurant</span>
        </div>
        <p className="text-white leading-relaxed max-w-[320px] mb-4">
          Thưởng thức hương vị của Nhà hàng chúng tôi — khám phá thực đơn hấp dẫn và đặt món ăn yêu thích của
          bạn một cách dễ dàng.
        </p>
      </div>
      <div className="self-start">
        <h3 className="text-white text-xl font-semibold mb-6 tracking-wide">Khám phá nhanh</h3>
        <ul className="space-y-3 text-white/80 font-medium">
          {[
            { name: "Trang chủ", to: "/" },
            { name: "Menu", to: "/menu" },
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
        <h3 className="text-white text-xl font-semibold mb-6 tracking-wide">Liên hệ</h3>
        <ul className="space-y-3 text-white/80 text-base">
          <li className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400">phamminhthuan912@gmail.com</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-orange-400" />
            <span>+0123 456 7890</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-orange-400/70 mr-1" />
            <span>123 HV HCM City</span>
          </li>
        </ul>
        <div className="h-px bg-white/20 my-6"></div>
        <p className="text-white/60 text-sm">
          ©2026 <span className="font-semibold text-orange-400">Restaurant</span>. Bản quyền thuộc về chúng
          tôi.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
