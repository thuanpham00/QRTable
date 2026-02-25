"use server";

import { defaultLocale, Locale } from "@/utils/config";
import { cookies } from "next/headers";

const cookieName = "NEXT_LOCALE";

export async function getUserLocale() {
  return (await cookies()).get(cookieName)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(cookieName, locale);
}
