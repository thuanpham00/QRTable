import { envConfig } from "@/utils/config";

export const baseOpenGraph = {
  locale: "en_US",
  alternateLocale: ["vi_VN"],
  type: "website",
  siteName: "QRTable",
  images: [
    {
      url: `${envConfig.NEXT_PUBLIC_URL}/banner.png`,
    },
  ],
};
