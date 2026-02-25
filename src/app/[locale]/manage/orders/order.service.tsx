/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  OrderObjectByGuestID,
  ServingGuestByTableNumber,
  Statics,
} from "@/app/[locale]/manage/orders/order-table-session";
import { OrderStatus } from "@/constants/type";
import { GetOrdersResType } from "@/schemaValidations/order.schema";
import { useMemo } from "react";

/**
 * statics: Thống kê số lượng đơn hàng theo trạng thái và bàn
 * {
  status: {
    Pending: 5,      // Tổng số đơn chờ xác nhận
    Processing: 3,   // Tổng số đơn đang nấu
    Delivered: 2,    // Tổng số đơn đã phục vụ
    Paid: 10,        // Tổng số đơn đã thanh toán
    Rejected: 1      // Tổng số đơn bị từ chối
  },
  table: {
    1: {              // Bàn số 1
      20: {           // Guest ID 20
        Pending: 2,
        Processing: 1,
        ...
      },
      21: { ... }     // Guest ID 21
    },
    2: { ... }        // Bàn số 2
  }
}
 * 
 */

/**
 *  servingGuestByTableNumber: Khách đang được phục vụ theo bàn
    1: {              // Bàn 1
      20: [orders],   // Chỉ guest đang có đơn Pending/Processing/Delivered
      21: [orders]
    }
 */

export const useOrderService = (orderList: GetOrdersResType["data"]) => {
  const result = useMemo(() => {
    const statics: Statics = {
      status: {
        Pending: 0,
        Processing: 0,
        Delivered: 0,
        Paid: 0,
        Rejected: 0,
      },
      table: {},
    };
    const orderObjectByGuestId: OrderObjectByGuestID = {};
    const guestByTableNumber: ServingGuestByTableNumber = {};
    orderList.forEach((order) => {
      statics.status[order.status] = statics.status[order.status] + 1;
      // Nếu table và guest chưa bị xóa
      if (order.tableNumber !== null && order.guestId !== null) {
        if (!statics.table[order.tableNumber]) {
          statics.table[order.tableNumber] = {};
        }
        statics.table[order.tableNumber][order.guestId] = {
          ...statics.table[order.tableNumber]?.[order.guestId],
          [order.status]: (statics.table[order.tableNumber]?.[order.guestId]?.[order.status] ?? 0) + 1,
        };
      }

      // Tính toán cho orderObjectByGuestId
      if (order.guestId) {
        if (!orderObjectByGuestId[order.guestId]) {
          orderObjectByGuestId[order.guestId] = [];
        }
        orderObjectByGuestId[order.guestId].push(order);
      }

      // Tính toán cho guestByTableNumber
      if (order.tableNumber && order.guestId) {
        if (!guestByTableNumber[order.tableNumber]) {
          guestByTableNumber[order.tableNumber] = {};
        }
        guestByTableNumber[order.tableNumber][order.guestId] = orderObjectByGuestId[order.guestId];
      }
    });

    // Cần phải lọc lại 1 lần nữa mới chuẩn
    // Những guest nào mà không còn phục vụ nữa sẽ bị loại bỏ
    const servingGuestByTableNumber: ServingGuestByTableNumber = {};
    for (const tableNumber in guestByTableNumber) {
      const guestObject = guestByTableNumber[tableNumber];
      const servingGuestObject: OrderObjectByGuestID = {};
      for (const guestId in guestObject) {
        const guestOrders = guestObject[guestId];
        const isServingGuest = guestOrders.some((order) =>
          [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered].includes(order.status as any),
        );
        if (isServingGuest) {
          servingGuestObject[Number(guestId)] = guestOrders;
        }
      }
      if (Object.keys(servingGuestObject).length) {
        servingGuestByTableNumber[Number(tableNumber)] = servingGuestObject;
      }
    }
    return {
      statics,
      servingGuestByTableNumber,
    };
  }, [orderList]);
  return result;
};
