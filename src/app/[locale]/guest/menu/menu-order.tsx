"use client";
import Quantity from "@/app/[locale]/guest/menu/quantity";
import { Button } from "@/components/ui/button";
import { MenuItemStatus, OrderMode, OrderModeType } from "@/constants/type";
import { cn, decodeToken, formatCurrency, handleErrorApi, setOrderTypeQRFromLocalStorage } from "@/lib/utils";
import { useGuestOrderMutation } from "@/queries/useGuest";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import Image from "next/image";
import { ChangeEvent, Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetMenuActiveQuery, useGetMenuSuggestedQuery } from "@/queries/useMenu";
import { Badge } from "@/components/ui/badge";
import logoFavourite from "../../../../../public/images/favorites.png";
import { useAppStore } from "@/components/app-provider";
import { Check, House, Truck } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Chatbot from "@/app/[locale]/guest/menu/chatbot";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type OrderList = (GuestCreateOrdersBodyType["listOrder"][number] & {
  price: number;
})[];

export default function MenuOrder() {
  const t = useTranslations("GuestOrderPage");
  const socket = useAppStore((state) => state.socket);
  const infoGuest = useAppStore((state) => state.infoGuest);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);

  const orderMutation = useGuestOrderMutation();
  const { data: activeData } = useGetMenuActiveQuery();
  const { data: suggestedData } = useGetMenuSuggestedQuery();

  const menuActive = activeData?.payload.data;
  const menuSuggested = suggestedData?.payload.data;

  const menuItems = menuActive?.menuItems || [];
  const [orders, setOrders] = useState<OrderList>([]);
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Nên thử");

  const [orderMode, setOrderMode] = useState<OrderMode>(OrderModeType.DINE_IN);
  const [pendingOrderMode, setPendingOrderMode] = useState<OrderMode | null>(null);

  useEffect(() => {
    if (infoGuest?.orderTypeQR) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderMode(infoGuest.orderTypeQR as OrderMode);
    }
  }, [infoGuest?.orderTypeQR]);

  // Group menu items by category
  const groupedByCategory = menuItems
    .filter((item) => item.status !== MenuItemStatus.HIDDEN)
    .reduce(
      (acc, menuItem) => {
        const categoryName = menuItem.dish.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(menuItem);
        return acc;
      },
      {} as Record<string, typeof menuItems>,
    );

  const groupedByCategoryAndTry: Record<string, typeof menuItems> = {
    ...groupedByCategory,
    ...{ "Nên thử": menuSuggested || [] },
  };
  const listDishInSelectedCategory = groupedByCategoryAndTry[selectedCategory] || [];

  const handleChangeQuantity = (menuItemId: number, quantity: number, price: number) => {
    if (quantity === 0) {
      // Xóa món khỏi orders khi quantity = 0
      setOrders(orders.filter((order) => order.menuItemId !== menuItemId));
      return;
    }

    const checkOrderExits = orders.find((order) => order.menuItemId === menuItemId);
    if (checkOrderExits) {
      // cập nhật số lượng
      const updatedOrders = orders.map((order) => {
        if (order.menuItemId === menuItemId) {
          return {
            ...order,
            quantity: quantity,
            price: price,
          };
        }
        return order;
      });
      setOrders(updatedOrders);
    } else {
      // thêm món mới
      setOrders([...orders, { menuItemId: menuItemId, quantity: quantity, price: price }]);
    }
  };

  const totalPriceOrder = orders.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [listNoteFood, setListNoteFood] = useState<{ menuItemId: number; note: string }[]>([]);
  console.log(listNoteFood);

  const handleChangeValueNote = (event: ChangeEvent<HTMLTextAreaElement>, menuItemId?: number) => {
    const { value } = event.target;
    const findNote = listNoteFood.find((item) => item.menuItemId === menuItemId);
    if (findNote) {
      // Cập nhật ghi chú nếu đã tồn tại
      setListNoteFood((prev) =>
        prev.map((item) => (item.menuItemId === menuItemId ? { ...item, note: value } : item)),
      );
      return;
    }
    // Thêm ghi chú mới nếu chưa tồn tại
    setListNoteFood((prev) => [...prev, { menuItemId: menuItemId!, note: value }]);
  };

  const handleOrder = async () => {
    if (orders.length === 0) {
      toast.error("Vui lòng chọn món ăn trước khi gọi món");
      return;
    }
    if (orderMutation.isPending) return;
    const listOrder = orders.map((order) => {
      const findMenuItem = listNoteFood.find((item) => item.menuItemId === order.menuItemId);
      return {
        menuItemId: order.menuItemId,
        quantity: order.quantity,
        note: findMenuItem ? findMenuItem.note : null,
      };
    });
    try {
      const body = {
        listOrder: listOrder,
        typeOrder: orderMode,
      };
      const {
        payload: { message },
      } = await orderMutation.mutateAsync(body);
      setOrders([]);
      toast.success(message, {
        duration: 2000,
      });
      router.push("/guest/orders");
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  const TIME_LIMIT = 5 * 60 * 1000; // 5 phút
  const MAX_CALLS = 3;
  const [callTimestamps, setCallTimestamps] = useState<number[]>([]);

  const handleCallWaiter = () => {
    if (!socket || !infoGuest) return;
    // trong 5p chỉ gọi được tối đa 3 lần

    const now = Date.now();
    // Lọc bỏ các lần gọi cũ hơn 5 phút
    const recentCalls = callTimestamps.filter((timestamp) => now - timestamp < TIME_LIMIT);

    if (recentCalls.length >= MAX_CALLS) {
      toast.error("Bạn đã gọi nhân viên 3 lần trong 5 phút. Vui lòng chờ nhân viên đến phục vụ.");
      return;
    }

    const idGuest = decodeToken(infoGuest.tokenGuestId).userId;

    setCallTimestamps([...recentCalls, now]);

    socket.emit("guest:call-waiter", {
      tableNumber: infoGuest.tableNumber,
      idGuest: idGuest.toString(),
    });
    // gửi xuống bàn nào đang sử dụng ứng dụng và khách nào gọi
    toast.success("Đã gọi nhân viên phục vụ!", {
      duration: 2000,
    });
  };

  const handleChangeOrderMode = (newMode: OrderMode) => {
    if (newMode === orderMode) return; // Nếu click vào mode hiện tại thì bỏ qua
    setPendingOrderMode(newMode);
  };

  const confirmChangeMode = () => {
    if (pendingOrderMode !== null) {
      setOrderMode(pendingOrderMode);
      if (infoGuest) {
        // Cập nhật Zustand store
        setInfoGuest({
          ...infoGuest,
          orderTypeQR: pendingOrderMode as OrderMode,
        });
        // Cập nhật localStorage
        setOrderTypeQRFromLocalStorage(pendingOrderMode);
      }
    }
    setPendingOrderMode(null);
  };

  const listSortCategory = Object.keys(groupedByCategoryAndTry).sort((a, b) => {
    if (a === "Nên thử") return -1;
    if (b === "Nên thử") return 1;
    return a.localeCompare(b);
  });

  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div>
      <h1 className="text-center text-xl font-bold">
        {menuActive?.name ? menuActive.name : "Menu quán"} -{" "}
        <Badge variant="default">
          {" "}
          {infoGuest?.tableTypeQR === OrderModeType.DINE_IN
            ? `${t("table")} ${infoGuest.tableNumber}`
            : t("TakeAway")}
        </Badge>
      </h1>

      <div className="my-4 flex gap-2 items-center justify-end">
        <Button
          className="inline-flex items-center justify-between dark:bg-white!"
          onClick={() => {
            if (orders.length === 0) {
              toast.error("Vui lòng chọn món ăn trước khi gọi món");
              return;
            }
            setOpen(true);
          }}
        >
          <span>
            {t("Order")} ({orders.length})
          </span>
          <span>{formatCurrency(totalPriceOrder)} </span>
        </Button>

        {(infoGuest?.orderTypeQR === OrderModeType.DINE_IN ||
          infoGuest?.tableTypeQR === OrderModeType.DINE_IN) && (
          <Fragment>
            <Button
              onClick={() => handleChangeOrderMode(OrderModeType.DINE_IN)}
              className={cn(
                "border border-red-500! bg-background! dark:bg-background! flex items-center gap-2",
                {
                  "bg-red-500! dark:bg-red-500! dark:text-white": orderMode === OrderModeType.DINE_IN,
                },
              )}
            >
              <House
                className={cn("text-black dark:text-white", {
                  "text-white dark:text-white": orderMode === OrderModeType.DINE_IN,
                })}
              />

              <span
                className={cn("text-black dark:text-white", {
                  "text-white dark:text-white": orderMode === OrderModeType.DINE_IN,
                })}
              >
                {t("DineIn")}
              </span>
              {orderMode === OrderModeType.DINE_IN && <Check className="text-white dark:text-foreground" />}
            </Button>

            <Button
              onClick={() => handleChangeOrderMode(OrderModeType.TAKE_OUT)}
              className={cn(
                "border border-red-500! bg-background! dark:bg-background! flex items-center gap-2",
                {
                  "bg-red-500! dark:bg-red-500! dark:text-white": orderMode === OrderModeType.TAKE_OUT,
                },
              )}
            >
              <Truck
                className={cn("text-black dark:text-white", {
                  "text-white dark:text-white": orderMode === OrderModeType.TAKE_OUT,
                })}
              />

              <span
                className={cn("text-black dark:text-white", {
                  "text-white dark:text-white": orderMode === OrderModeType.TAKE_OUT,
                })}
              >
                {t("TakeAway")}
              </span>

              {orderMode === OrderModeType.TAKE_OUT && <Check className="text-white dark:text-foreground" />}
            </Button>
          </Fragment>
        )}

        {infoGuest?.orderTypeQR === OrderModeType.TAKE_OUT &&
          infoGuest.tableTypeQR === OrderModeType.TAKE_OUT && (
            <div className="p-2 rounded bg-red-500 text-white">{t("takeawayModeNotice")}</div>
          )}
      </div>
      <div className="grid grid-cols-6 gap-3">
        <div className="col-span-2 lg:col-span-1">
          {listSortCategory.map((categoryName, index) => {
            return (
              <Button
                key={categoryName}
                onClick={() => setSelectedCategory(categoryName)}
                className={cn(
                  "uppercase tracking-wide w-full text-left! justify-start py-6 dark:bg-card! dark:text-foreground bg-gray-200 text-foreground border-b border-gray-300 dark:border-white/60 hover:bg-background rounded-none",
                  {
                    "rounded-t-sm!": index === 0,
                    "rounded-b-sm! border-b-0": index === listSortCategory.length - 1,
                    "dark:bg-white! bg-black! text-white dark:text-black": selectedCategory === categoryName,
                  },
                )}
              >
                {categoryName === "Nên thử" && (
                  <Image
                    src={logoFavourite.src}
                    alt="favorites"
                    width={30}
                    height={30}
                    className="inline-block"
                  />
                )}
                {categoryName}
              </Button>
            );
          })}

          <div className="flex flex-col justify-end mt-4">
            <div className="flex flex-col gap-2">
              <Button
                className="flex-1 block text-center bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setShowChatbot(true)}
              >
                <span>{t("Chatbot")}</span>
              </Button>
              <Button
                className="flex-1 block text-center bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => handleCallWaiter()}
              >
                <span>{t("GuestCall")}</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="col-span-4 lg:col-span-5">
          <div className="flex flex-col h-[calc(100vh-210px)] overflow-y-auto gap-6 pb-2 mb-2">
            <div className="space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {listDishInSelectedCategory.map((item) => {
                const dish = item.dish;
                const isOutOfStock = item.status === MenuItemStatus.OUT_OF_STOCK;
                return (
                  <div key={dish.id} className="flex flex-col rounded-md border-2 border-border">
                    <div className="shrink-0 relative w-full h-62.5">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        unoptimized
                        className="object-cover rounded-tl-md rounded-tr-md"
                      />
                      {isOutOfStock && (
                        <div>
                          <div className="absolute inset-0 w-full h-62.5 z-1 bg-gray-700 opacity-50 rounded-md"></div>
                          <div className="p-3 absolute top-1/2 left-1/2 z-1 -translate-x-1/2 -translate-y-1/2 rounded-lg font-semibold text-sm text-white block text-center w-24 border-2 border-white">
                            Hết hàng
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="px-3 pt-2 pb-4 bg-background dark:bg-border  border-t-0 rounded-bl-md rounded-br-md">
                      <h3 className="text-[15px] font-semibold line-clamp-1">{dish.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 h-10">{dish.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-bold text-white bg-linear-to-r from-orange-500 to-amber-500 inline-block px-3 py-1 rounded-lg shadow-lg">
                          {formatCurrency(item.price)}
                        </div>
                        <Quantity
                          value={orders.find((order) => order.menuItemId === item.id)?.quantity || 0}
                          onChange={(quantity) => handleChangeQuantity(item.id, quantity, item.price)}
                          status={item.status}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmOrderTitle")}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t("confirmOrderDesc", { count: orders.length })}{" "}
                </p>
                <div className="space-y-2 max-h-68 overflow-y-auto">
                  {orders.map((order) => {
                    const menuItem = menuItems.find((item) => item.id === order.menuItemId);
                    const dish = menuItem?.dish;
                    return (
                      <div key={order.menuItemId} className="mb-3">
                        <div className="flex justify-between items-center text-sm bg-gray-200 dark:bg-card p-2 rounded">
                          <div className="flex-1 text-left">
                            <span className="font-medium text-black dark:text-white">{dish?.name}</span>
                            <span className="text-muted-foreground"> x{order.quantity}</span>
                          </div>
                          <span className="font-semibold text-orange-600">
                            {formatCurrency(order.price * order.quantity)}
                          </span>
                        </div>

                        <div className="mt-2">
                          <Label className="mb-2">Ghi chú:</Label>
                          <Textarea
                            placeholder={`Ghi chú cho món ${dish?.name}`}
                            onChange={(event) => handleChangeValueNote(event, order.menuItemId)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">{t("orderTypeLabel")}</span>
                  <span className="text-lg font-bold text-orange-600">
                    {orderMode === OrderModeType.DINE_IN ? t("orderTypeDineIn") : t("orderTypeTakeAway")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t("totalLabel")}</span>
                  <span className="text-lg font-bold text-orange-600">{formatCurrency(totalPriceOrder)}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleOrder}>{t("confirmOrderAction")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingOrderMode !== null}
        onOpenChange={(open) => !open && setPendingOrderMode(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmChangeModeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmChangeModeDesc")}{" "}
              <strong className="text-orange-600">
                {pendingOrderMode === OrderModeType.DINE_IN ? t("DineIn") : t("TakeAway")}
              </strong>
              ?
              {orders.length > 0 && (
                <span className="block mt-2 text-yellow-600">
                  {t("noteOrder", { ordersLength: orders.length })}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingOrderMode(null)}>
              {t("cancelChangeMode")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmChangeMode}>{t("confirmChangeMode")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Chatbot showModal={showChatbot} setShowModal={setShowChatbot} />
    </div>
  );
}

// SSG chỉ build được phần server component (lớp ngoài).
// Client component như MenuOrder luôn render ở client, không build được HTML tĩnh cho phần đó.
