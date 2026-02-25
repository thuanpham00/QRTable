/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "@/i18n/routing";
import {
  getAccessTokenFromLocalStorage,
  normalizePath,
  removeTokenFromLocalStorage,
  setAccessTokenFromLocalStorage,
  setRefreshTokenFromLocalStorage,
} from "@/lib/utils";
import { LoginResType } from "@/schemaValidations/auth.schema";
import { defaultLocale, envConfig } from "@/utils/config";
import Cookies from "js-cookie";

type CustomOptions = Omit<RequestInit, "method"> & {
  baseUrl?: string | undefined;
};

const ENTITY_ERROR_STATUS = 422;
const AUTHENTICATION_ERROR_STATUS = 401;

type EntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [field: string]: any;
  };
  constructor({
    status,
    payload,
    message = "HTTP Error",
  }: {
    status: number;
    payload: any;
    message?: string;
  }) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS;
  payload: EntityErrorPayload;
  constructor({ status, payload }: { status: typeof ENTITY_ERROR_STATUS; payload: EntityErrorPayload }) {
    super({ status, payload, message: "Entity Error" });
    this.status = ENTITY_ERROR_STATUS;
    this.payload = payload;
  }
}

export const isClient = typeof window !== "undefined";

const request = async <Response>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  options?: CustomOptions | undefined,
) => {
  let body: FormData | string | undefined = undefined;
  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body) {
    body = JSON.stringify(options?.body);
  }

  const baseHeaders: {
    [key: string]: string;
  } =
    body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        };

  if (isClient) {
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      baseHeaders["Authorization"] = `Bearer ${accessToken}`; // chỉ truyền token được ở client // ở server component thì phải tự truyền vào - thêm thủ công
    }
  }

  const baseUrl = options?.baseUrl === undefined ? envConfig.NEXT_PUBLIC_API_ENDPOINT : options.baseUrl;
  const fullUrl = url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    } as any,
    method,
    body,
    // credentials: "include", // dùng cho Mode_Cookie = true
  });
  const payload: Response = await res.json();
  const data = {
    status: res.status,
    payload,
  };
  // đưa về 1 kiểu dữ liệu response chung
  // chỉ có next client mới gọi được tới next server và lấy được cookie ra
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: 422;
          payload: EntityErrorPayload;
        },
      );
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      // xử lý token hết hạn hoặc ko hợp lệ thì logout - xử lý ở client
      if (isClient) {
        const locale = Cookies.get("NEXT_LOCALE");

        // case token hết hạn hoặc ko hợp lệ -> xóa token ở client
        await fetch("/api/auth/logout", {
          method: "POST",
          body: null, // Logout mình sẽ cho phép luôn thành công
          headers: {
            ...baseHeaders,
          } as any,
        });
        try {
        } catch (error) {
          console.log(error);
        } finally {
          removeTokenFromLocalStorage();
          // Redirect về trang login có thể bị loop vô hạn nếu ko xử lý đúng cách
          // vì nếu rơi vào trường hợp tại trang login, chúng ta có gọi các API cần AT
          // mà AT đã bị xóa thì nó lại nhảy vào đây và cứ thế nó sẽ bị lặp
          location.href = `/${locale}/login`; // gọi theo kiểu client - reload trang
        }
      } else {
        // xử lý token hết hạn hoặc ko hợp lệ thì logout - xử lý ở server
        // và chúng ta gọi API ở nextjs server (route handler, server component)
        const accessToken = (options?.headers as any)?.Authorization.split("Bearer ")[1];
        const locale = Cookies.get("NEXT_LOCALE");
        redirect({
          href: `/login?accessToken=${accessToken}`,
          locale: locale ?? defaultLocale,
        });
      }
    } else {
      throw new HttpError(data as any);
    }
  }
  if (isClient) {
    // chỉ chạy ở client - route này là route handler của nextjs
    if (["api/auth/login", "api/guest/auth/login"].some((item) => item === normalizePath(url))) {
      const { accessToken, refreshToken } = (payload as LoginResType).data;
      setAccessTokenFromLocalStorage(accessToken);
      setRefreshTokenFromLocalStorage(refreshToken);
    } else if (["api/auth/login-oauth"].some((item) => item === normalizePath(url))) {
      const { accessToken, refreshToken } = payload as any;
      setAccessTokenFromLocalStorage(accessToken);
      setRefreshTokenFromLocalStorage(refreshToken);
    } else if (["api/auth/logout", "api/guest/auth/logout"].some((item) => item === normalizePath(url))) {
      removeTokenFromLocalStorage();
    }
  }
  return data;
};

const http = {
  get<Response>(url: string, options?: Omit<CustomOptions, "body"> | undefined) {
    return request<Response>("GET", url, options);
  },

  post<Response>(url: string, body: any, options?: Omit<CustomOptions, "body"> | undefined) {
    return request<Response>("POST", url, { ...options, body });
  },

  put<Response>(url: string, body: any, options?: Omit<CustomOptions, "body"> | undefined) {
    return request<Response>("PUT", url, { ...options, body });
  },

  delete<Response>(url: string, options?: Omit<CustomOptions, "body"> | undefined) {
    return request<Response>("DELETE", url, { ...options });
  },
};

export default http;
