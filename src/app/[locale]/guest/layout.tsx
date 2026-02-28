import Layout from "@/app/[locale]/(public)/layout";
import { defaultLocale } from "@/utils/config";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout modal={null} params={Promise.resolve({ locale: defaultLocale })}>
      {children}
    </Layout>
  );
}
