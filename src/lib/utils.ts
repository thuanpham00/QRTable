/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityError, isClient } from "@/utils/http";
import { clsx, type ClassValue } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";
import { authRequests } from "@/apiRequests/auth";
import { DishStatus, OrderStatus, Role, TableStatus, GuestCallStatus, OrderModeType } from "@/constants/type";
import { envConfig } from "@/utils/config";
import { TokenPayload } from "@/types/jwt.types";
import { format } from "date-fns";
import guestApiRequest from "@/apiRequests/guest";
import { BookX, CookingPot, HandCoins, Loader, Truck } from "lucide-react";
import { io } from "socket.io-client";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : `/${path}`;
};

export const handleErrorApi = ({
  errors,
  setError,
  duration,
}: {
  errors: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (errors instanceof EntityError && setError) {
    errors.payload.errors.forEach((item) => {
      setError(item.field as "email" | "password" | "name" | "confirmPassword", {
        type: "server",
        message: item.message,
      });
    });
  } else {
    toast.error("Lỗi", {
      description: errors?.payload?.message || "Có lỗi xảy ra, vui lòng thử lại sau",
      duration: duration || 5000,
    });
  }
};

export const getAccessTokenFromLocalStorage = () => {
  return isClient ? localStorage.getItem("accessToken") : null;
};

export const setAccessTokenFromLocalStorage = (value: string) => {
  return isClient && localStorage.setItem("accessToken", value);
};

export const getRefreshTokenFromLocalStorage = () => {
  return isClient ? localStorage.getItem("refreshToken") : null;
};

export const setRefreshTokenFromLocalStorage = (value: string) => {
  return isClient && localStorage.setItem("refreshToken", value);
};

export const getTableNumberFromLocalStorage = () => {
  return isClient ? localStorage.getItem("tableNumber") : null;
};

export const setTableNumberFromLocalStorage = (value: string) => {
  return isClient && localStorage.setItem("tableNumber", value);
};

export const getOrderTypeQRFromLocalStorage = () => {
  return isClient ? localStorage.getItem("orderTypeQR") : null;
};

export const setOrderTypeQRFromLocalStorage = (value: string) => {
  return isClient && localStorage.setItem("orderTypeQR", value);
};

export const getTableTypeQRFromLocalStorage = () => {
  return isClient ? localStorage.getItem("tableTypeQR") : null;
};

export const setTableTypeQRFromLocalStorage = (value: string) => {
  return isClient && localStorage.setItem("tableTypeQR", value);
};

export const getNameGuestFromLocalStorage = () => {
  return isClient ? localStorage.getItem("nameGuest") : null;
};

export const setNameGuestFromLocalStorage = (value: string) => {
  return isClient && localStorage.setItem("nameGuest", value);
};

export const removeTokenFromLocalStorage = () => {
  isClient && localStorage.removeItem("accessToken");
  isClient && localStorage.removeItem("refreshToken");
  isClient && localStorage.removeItem("tableNumber");
  isClient && localStorage.removeItem("orderTypeQR");
  isClient && localStorage.removeItem("tableTypeQR");
  isClient && localStorage.removeItem("nameGuest");
};

export const checkAndRefreshToken = async (params?: {
  onError?: () => void;
  onSuccess?: () => void;
  force?: boolean;
}) => {
  const accessToken = getAccessTokenFromLocalStorage();
  const refreshToken = getRefreshTokenFromLocalStorage();
  if (!accessToken || !refreshToken) return;
  const decodedAccessToken = jwt.decode(accessToken) as { exp: number; iat: number };
  const decodedRefreshToken = jwt.decode(refreshToken) as TokenPayload;

  // thời điểm hết hạn token là tính theo epoch time (s)
  // còn khi các bạn dùng cú pháp new Date().getTime() thì nó trả về epoch time (ms)
  const now = new Date().getTime() / 1000 - 1; // chuyển về s // khi set cookie với expires thì sẽ bị lệch 0 - 1000ms nên trừ thêm 1

  //trường hợp refresh token hết hạn thì cho logout
  if (decodedRefreshToken.exp <= now) {
    removeTokenFromLocalStorage();
    // cookie tự delete nên không cần can thiệp (chỉ cần đợi hết hạn)
    params?.onError && params.onError();
    return;
  }

  // ví dụ access token của chúng ta có thời gian hết hạn là 10s
  // thì mình kiểm tra còn 1/3 thời gian (3s) thì mình sẽ gọi refresh token
  // thời gian còn lại tính dựa trên công thức decodedAccessToken.exp - now
  // thời gian hết hạn của access token dựa trên công thức: decodedAccessToken.exp - decodedAccessToken.iat
  if (params?.force || decodedAccessToken.exp - now < (decodedAccessToken.exp - decodedAccessToken.iat) / 3) {
    // goi refresh token
    try {
      const role = decodedRefreshToken.role;
      const {
        payload: {
          data: { accessToken, refreshToken },
        },
      } =
        role === Role.Guest
          ? await guestApiRequest.refreshToken_nextjs()
          : await authRequests.refreshToken_nextjs(); // set cookie ở đây
      setAccessTokenFromLocalStorage(accessToken);
      setRefreshTokenFromLocalStorage(refreshToken);
      params?.onSuccess && params.onSuccess();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      params?.onError && params.onError();
    }
  }
};

export const getVietnameseDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Active:
      return "Đang hoạt động";
    case DishStatus.Discontinued:
      return "Ngừng phục vụ";
    default:
      return "Ngừng phục vụ";
  }
};

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

export const getVietnameseTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return "Có sẵn";
    case TableStatus.Serving:
      return "Đang phục vụ";
    default:
      return "Ẩn";
  }
};

export const getVietnameseOrderModeStatus = (status: (typeof OrderModeType)[keyof typeof OrderModeType]) => {
  switch (status) {
    case OrderModeType.DINE_IN:
      return "Ăn tại chỗ";
    case OrderModeType.TAKE_OUT:
      return "Mang đi";
    default:
      return "Ăn tại chỗ";
  }
};

export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.Delivered:
      return "Đã phục vụ";
    case OrderStatus.Paid:
      return "Đã thanh toán";
    case OrderStatus.Pending:
      return "Chờ xử lý";
    case OrderStatus.Processing:
      return "Đang nấu";
    default:
      return "Từ chối";
  }
};

export const getVietnameseGuestCallStatus = (
  status: (typeof GuestCallStatus)[keyof typeof GuestCallStatus],
) => {
  switch (status) {
    case GuestCallStatus.Pending:
      return "Chờ xử lý";
    case GuestCallStatus.Completed:
      return "Đã hoàn thành";
    case GuestCallStatus.Rejected:
      return "Từ chối";
    default:
      return "Không xác định";
  }
};

export const getTableLink = ({
  locale,
  token,
  tableNumber,
  type,
}: {
  locale: string;
  token: string;
  tableNumber: number;
  type: string;
}) => {
  return (
    envConfig.NEXT_PUBLIC_URL +
    "/" +
    locale +
    "/tables/" +
    tableNumber +
    "?token=" +
    token +
    "&typeQR=" +
    type
  );
};

export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload;
};

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), "HH:mm:ss dd/MM/yyyy");
};

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), "HH:mm:ss");
};

export function removeAccents(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(removeAccents(matchText.trim().toLowerCase()));
};

export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Rejected]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins,
};

export const generateSocket = (accessToken: string) => {
  return io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
    auth: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const wrapServerApi = async <T>(fn: () => Promise<T>) => {
  let result = null;
  try {
    result = await fn();
  } catch (error: any) {
    if (error.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
  }
  return result;
};

export const generateSlugUrl = ({ name, id }: { name: string; id: number }) => {
  return `${slugify(name)}-i.${id}`;
};

export const getIdFromSlugUrl = (slug: string) => {
  return Number(slug.split("-i.")[1]);
};

/**
 * Tạo mã lô (batch number) ngẫu nhiên theo format: BATCH-XX-X-XXXXXX
 * Ví dụ: BATCH-48-2-512145
 * @returns Chuỗi mã lô ngẫu nhiên
 */
export const generateBatchNumber = (): string => {
  const part1 = Math.floor(Math.random() * 90) + 10; // 2 chữ số: 10-99
  const part2 = Math.floor(Math.random() * 9) + 1; // 1 chữ số: 1-9
  const part3 = Math.floor(Math.random() * 900000) + 100000; // 6 chữ số: 100000-999999

  return `BATCH-${part1}-${part2}-${part3}`;
};
