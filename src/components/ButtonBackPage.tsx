"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/routing";

export default function ButtonBackPage() {
  const router = useRouter();
  return (
    <div className="hidden sm:block">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className={
          "inline-flex items-center gap-2 rounded-lg py-1.5 text-sm font-medium " +
          "text-black dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors "
        }
      >
        <ArrowLeft className="w-4 h-4 stroke-current" />
        <span>Quay lại</span>
      </button>
    </div>
  );
}
