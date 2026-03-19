import { LogoutBodyType, RefreshTokenBodyType, RefreshTokenResType } from "@/schemaValidations/auth.schema";
import {
  GuestCreateOrdersBodyType,
  GuestCreateOrdersResType,
  GuestGetOrdersResType,
  GuestGetPaymentsResType,
  GuestLoginBodyType,
  GuestLoginResType,
} from "@/schemaValidations/guest.schema";
import http from "@/utils/http";

const guestApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: RefreshTokenResType;
  }> | null,

  login_nextjs: (body: GuestLoginBodyType) => {
    return http.post<GuestLoginResType>("/api/guest/auth/login", body, {
      baseUrl: "",
    });
  },
  login_backend: (body: GuestLoginBodyType) => {
    return http.post<GuestLoginResType>("/guest/auth/login", body);
  },

  logout_nextjs: () => {
    return http.post("/api/guest/auth/logout", null, { baseUrl: "" }); // client gọi đến route handler, không cần truyền AT và RT vào body vì AT và RT tự  động gửi thông qua cookie rồi
  },
  logout_backend: (
    body: LogoutBodyType & {
      accessToken: string;
    }
  ) => {
    return http.post(
      "/guest/auth/logout",
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      }
    );
  },

  refreshToken_nextjs: () => {
    return http.post<RefreshTokenResType>("/api/guest/auth/refresh-token", null, {
      baseUrl: "",
    });
  },

  refreshToken_backend: (body: RefreshTokenBodyType) => {
    return http.post<RefreshTokenResType>("/guest/auth/refresh-token", body);
  },

  getOrderList: () => http.get<GuestGetOrdersResType>("/guest/orders"),
  order: (body: GuestCreateOrdersBodyType) => http.post<GuestCreateOrdersResType>("/guest/orders", body),
  getPaymentHistory: () => http.get<GuestGetPaymentsResType>("/guest/payments"),
};

export default guestApiRequest;
