import { Role } from "@/constants/type";
import { decodeToken } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/utils/config";
import createIntlMiddleware from "next-intl/middleware";

const authPath = ["/vi/login", "/en/login"];
const managePath = ["/vi/manage", "/en/manage"];
const guestPath = ["/vi/guest", "/en/guest"];

const onlyOwnerPath = [
  "/vi/manage/accounts",
  "/vi/manage/categories",
  "/vi/manage/dishes",
  "/vi/manage/ingredients",
  "/en/manage/accounts",
  "/en/manage/categories",
  "/en/manage/dishes",
  "/en/manage/ingredients",
];
const privatePath = [...managePath, ...guestPath];

export function middleware(request: NextRequest) {
  /**
   * Khi localeDetection: true (mặc định), next-intl sẽ tự động detect locale theo thứ tự ưu tiên:
    Cookie NEXT_LOCALE (nếu có)
    Browser Accept-Language header (ví dụ: vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7)
    defaultLocale (fallback cuối cùng)
   */
  const handleI18nRouting = createIntlMiddleware({
    locales: locales,
    defaultLocale,
    localeDetection: false,
  });
  const response = handleI18nRouting(request);

  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const locale = request.cookies.get("NEXT_LOCALE")?.value ?? defaultLocale;
  console.log(locale);
  // 1. Chưa đăng nhập
  // trường hợp chưa đăng nhập thì ko vào được privatePath
  // cũng dành cho trường hợp đã đăng nhập nhưng RT hết hạn rồi
  if (privatePath.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL(`/${locale}/login`, request.url);
    url.searchParams.set("clearTokens", "true");
    return NextResponse.redirect(url); // tích hợp i18n vào middleware thì chỗ này NextResponse ko cần
    // response.headers.set("x-middleware-rewrite", url.toString());
    // return response;
  }

  // 2. Đã đăng nhập
  if (refreshToken) {
    // 2.1 trường hợp đăng nhập rồi thì ko vào được login nữa
    if (authPath.some((path) => pathname.startsWith(path)) && refreshToken) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
      // const url = new URL("/en", request.url);
      // response.headers.set("x-middleware-rewrite", url.toString());
      // return response;
    }

    // 2.2 trường hợp đăng nhập rồi và AT trong cookie hết hạn
    if (privatePath.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
      const url = new URL(`/${locale}/refresh-token`, request.url);
      // xử lý case AT tại cookie bị xóa redirect sang /refresh-token để lấy AT mới
      url.searchParams.set("refreshToken", refreshToken ?? "");
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
      // response.headers.set("x-middleware-rewrite", url.toString());
      // return response;
    }

    // 2.3 Vào không đúng role, redirect về trang chủ
    const role = decodeToken(refreshToken).role;
    // ko phải owner mà vào các trang chỉ dành cho owner
    const isNotOwnerPath = role !== Role.Owner && onlyOwnerPath.some((path) => pathname.startsWith(path));
    if (
      (role === Role.Guest && managePath.some((path) => pathname.startsWith(path))) ||
      (role !== Role.Guest && guestPath.some((path) => pathname.startsWith(path))) ||
      isNotOwnerPath
    ) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
      // const url = new URL("/", request.url);
      // response.headers.set("x-middleware-rewrite", url.toString());
      // return response;
    }

    // return NextResponse.next();
    return response;
  }
  return response;
}

// luôn chạy trên phía Next (server/edge runtime),
// mỗi lần có request vào, trước khi tới route/page tương ứng.

export const config = {
  matcher: ["/", "/(en|vi)/:path*"],
};
