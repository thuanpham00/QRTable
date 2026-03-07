/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import RefreshToken from "@/components/refresh-token";
import { Fragment, useEffect } from "react";
import {
  decodeToken,
  generateSocket,
  getAccessTokenFromLocalStorage,
  getNameGuestFromLocalStorage,
  getOrderTypeQRFromLocalStorage,
  getTableNumberFromLocalStorage,
  getTableTypeQRFromLocalStorage,
  removeTokenFromLocalStorage,
} from "@/lib/utils";
import { RoleType } from "@/types/jwt.types";
import { create } from "zustand";
import { Socket } from "socket.io-client";
import LogoutSocket from "@/components/logout-socketed";
import { useCountPendingGuestCallTodayQuery } from "@/queries/useGuestCall";
import { endOfDay, startOfDay } from "date-fns";
import { OrderMode, Role } from "@/constants/type";
import { useCountOrderTodayQuery } from "@/queries/useOrder";
import { useQueryClient } from "@tanstack/react-query";

type InfoGuestType = {
  name: string;
  tokenGuestId: string;
  tableNumber: string;
  orderTypeQR: OrderMode;
  tableTypeQR: OrderMode;
};

type AppStoreType = {
  isAuth: boolean;
  isRole: RoleType | undefined;
  setIsRole: (isRole: RoleType | undefined) => void;
  socket: Socket | undefined;
  setSocket: (socket: Socket | undefined) => void;

  infoGuest: InfoGuestType | undefined;
  setInfoGuest: (infoGuest: InfoGuestType | undefined) => void;

  countGuestCalls: number;
  setCountGuestCalls: (countGuestCalls: number) => void;

  countOrderToday: number;
  setCountOrderToday: (countOrderToday: number) => void;

  // Lưu data serving guests theo bàn để truyền sang trang detail
  selectedTableGuests: any;
  setSelectedTableGuests: (data: any) => void;
};

// dùng zustand
export const useAppStore = create<AppStoreType>((set) => ({
  isAuth: false,
  isRole: undefined as RoleType | undefined,
  setIsRole: (isRole: RoleType | undefined) => {
    set({ isRole: isRole, isAuth: Boolean(isRole) });
    if (!isRole) {
      removeTokenFromLocalStorage();
    }
  },
  socket: undefined,
  setSocket: (socket: Socket | undefined) => set({ socket }),

  infoGuest: undefined,
  setInfoGuest: (infoGuest: InfoGuestType | undefined) => set({ infoGuest }),

  countGuestCalls: 0,
  setCountGuestCalls: (countGuestCalls: number) => set({ countGuestCalls }),

  countOrderToday: 0,
  setCountOrderToday: (countOrderToday: number) => set({ countOrderToday }),

  selectedTableGuests: null,
  setSelectedTableGuests: (data: any) => set({ selectedTableGuests: data }),
}));

// setup React Query ở cấp cao nhất của ứng dụng
const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());
export default function AppProvider({ children }: { children: React.ReactNode }) {
  const isRole = useAppStore((state) => state.isRole);
  const socket = useAppStore((state) => state.socket);
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setSocket = useAppStore((state) => state.setSocket);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);
  const setCountGuestCalls = useAppStore((state) => state.setCountGuestCalls);
  const setCountOrderToday = useAppStore((state) => state.setCountOrderToday);

  const queryClient = useQueryClient();

  // lấy số cuộc gọi phục vụ từ khách hôm nay (pending)
  const countPending = useCountPendingGuestCallTodayQuery(
    {
      fromDate: initFromDate,
      toDate: initToDate,
    },
    {
      enabled: isRole !== Role.Guest && Boolean(isRole) && Boolean(socket), // có nghĩa là chỉ chạy khi đã login
    },
  );

  // lấy số order hôm nay
  const countOrder = useCountOrderTodayQuery(
    {
      fromDate: initFromDate,
      toDate: initToDate,
    },
    {
      enabled: isRole !== Role.Guest && Boolean(isRole) && Boolean(socket), // có nghĩa là chỉ chạy khi đã login
    },
  ); // fetch order list ngày hôm nay (mặc định)

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage();
    const tableNumber = getTableNumberFromLocalStorage();
    const orderTypeQR = getOrderTypeQRFromLocalStorage();
    const tableTypeQR = getTableTypeQRFromLocalStorage();
    const nameGuest = getNameGuestFromLocalStorage();
    if (accessToken) {
      const { role } = decodeToken(accessToken);
      setIsRole(role);
      setSocket(generateSocket(accessToken)); // khởi tạo socket khi login thành công

      if (tableNumber && orderTypeQR) {
        // nếu có tableNumber thì mới set
        setInfoGuest({
          name: nameGuest as string,
          tableNumber: tableNumber,
          tokenGuestId: accessToken,
          orderTypeQR: orderTypeQR as OrderMode, // type order có thể đổi
          tableTypeQR: tableTypeQR as OrderMode, // nhưng table type thì không đổi
        });
      }
    }
  }, [setIsRole, setSocket, setInfoGuest]);

  useEffect(() => {
    if (countPending.data?.payload.data !== undefined) {
      setCountGuestCalls(countPending.data.payload.data);
    }
    if (countOrder.data?.payload.data !== undefined) {
      setCountOrderToday(countOrder.data.payload.data);
    }
  }, [
    countPending?.data?.payload.data,
    setCountGuestCalls,
    countOrder?.data?.payload.data,
    setCountOrderToday,
  ]);

  useEffect(() => {
    if (!socket) return;

    function onGuestCallListener() {
      countPending.refetch();
    }

    function onCountOrder() {
      countOrder.refetch(); // đếm số lượng order hôm nay
    }

    function onUpdateStatusTable() {
      queryClient.invalidateQueries({ queryKey: ["tables"] }); // cập nhật lại danh sách bàn khi có order mới
    }

    // đếm số cuộc gọi phục vụ từ khách (global toàn app)
    socket.on("count-call-waiter", onGuestCallListener);
    socket.on("count-order", onCountOrder);
    socket.on("update-status-table", onUpdateStatusTable);
    socket.on("table-token-rotated", onUpdateStatusTable);

    return () => {
      socket.off("count-call-waiter", onGuestCallListener);
      socket.off("count-order", onCountOrder);
      socket.off("update-status-table", onUpdateStatusTable);
      socket.off("table-token-rotated", onUpdateStatusTable);
    };
  }, [socket, setCountGuestCalls, countPending, countOrder, queryClient]);

  return (
    <Fragment>
      <LogoutSocket />
      <RefreshToken />
      {children}
    </Fragment>
  );
}
