/* eslint-disable react-hooks/incompatible-library */
"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GuestLoginBody, GuestLoginBodyType } from "@/schemaValidations/guest.schema";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TablesDialog } from "@/app/[locale]/manage/orders/tables-dialog";
import { GetListGuestsResType } from "@/schemaValidations/account.schema";
import { Switch } from "@/components/ui/switch";
import GuestsDialog from "@/app/[locale]/manage/orders/guests-dialog";
import { CreateOrdersBodyType } from "@/schemaValidations/order.schema";
import Quantity from "@/app/[locale]/guest/menu/quantity";
import Image from "next/image";
import { cn, formatCurrency, handleErrorApi } from "@/lib/utils";
import { useCreateOrderMutation } from "@/queries/useOrder";
import { useCreateGuestMutation } from "@/queries/useAccount";
import { toast } from "sonner";
import { useGetMenuActiveQuery } from "@/queries/useMenu";
import { MenuActiveResType } from "@/schemaValidations/menu.schema";
import { MenuItemStatus, OrderMode, OrderModeType, OrderModeTypeValues } from "@/constants/type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export default function AddOrder() {
  const t = useTranslations("ManageOrders");

  const createOrderMutation = useCreateOrderMutation();
  const createGuestMutation = useCreateGuestMutation();

  const [open, setOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GetListGuestsResType["data"][0] | null>(null);
  const [isNewGuest, setIsNewGuest] = useState(true);
  const [orders, setOrders] = useState<CreateOrdersBodyType["orders"]>([]);

  const [searchDish, setSearchDish] = useState<string>("");
  const menuActiveQuery = useGetMenuActiveQuery();

  const menuItemsData: MenuActiveResType["data"]["menuItems"] =
    menuActiveQuery.data?.payload.data.menuItems || [];
  const menuItemsFiltered = menuItemsData.filter((item) =>
    item.dish.name.toLowerCase().includes(searchDish.toLowerCase()),
  );

  const totalPrice = menuItemsData.reduce((result, menuItem) => {
    const order = orders.find((order) => order.menuItemId === menuItem.id);
    if (!order) return result;
    return result + order.quantity * menuItem.price;
  }, 0);

  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: "",
      tableNumber: 0,
    },
  });

  const name = form.watch("name");
  const tableNumber = form.watch("tableNumber");

  const handleQuantityChange = (menuItemId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.menuItemId !== menuItemId);
      }
      const index = prevOrders.findIndex((order) => order.menuItemId === menuItemId);
      if (index === -1) {
        return [...prevOrders, { menuItemId, quantity }];
      }
      const newOrders = [...prevOrders];
      newOrders[index] = { ...newOrders[index], quantity };
      return newOrders;
    });
  };

  const handleOrder = async () => {
    try {
      if (isNewGuest && (form.getValues("name") === "" || form.getValues("tableNumber") === 0)) {
        toast.error("Vui lòng nhập tên và chọn bàn cho khách mới trước khi tạo đơn hàng.");
        return;
      }
      if (!isNewGuest && selectedGuest === null) {
        toast.error("Vui lòng chọn khách hàng trước khi tạo đơn hàng.");
        return;
      }
      let guestId = selectedGuest?.id;
      if (isNewGuest) {
        const guest = await createGuestMutation.mutateAsync({ name, tableNumber }); // tạo khách mới rồi mới tạo order
        guestId = guest.payload.data.id;
      }
      const {
        payload: { message },
      } = await createOrderMutation.mutateAsync({
        guestId: guestId!,
        orders,
        orderMode: orderMode,
      });
      reset();
      setOpen(false);
      toast.success(message, {
        duration: 4000,
      });
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  const reset = () => {
    form.reset();
    setOrders([]);
    setIsNewGuest(true);
    setSelectedGuest(null);
  };

  const [orderMode, setOrderMode] = useState<OrderMode>(OrderModeType.DINE_IN);

  return (
    <Dialog
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          reset();
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{t("createOrder")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-300 w-full max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("createOrder")}</DialogTitle>
        </DialogHeader>
        <div className="flex items-start gap-4">
          <div className="w-[40%] flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center justify-items-start gap-4">
              <Label htmlFor="isNewGuest">{t("guestNew")}</Label>
              <div className="col-span-3 flex items-center justify-start">
                <Switch id="isNewGuest" checked={isNewGuest} onCheckedChange={setIsNewGuest} />
              </div>
            </div>
            {isNewGuest && (
              <Form {...form}>
                <form
                  noValidate
                  className="grid auto-rows-max items-start gap-4 md:gap-8"
                  id="add-employee-form"
                >
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                            <Label htmlFor="name">{t("guestName")}</Label>
                            <div className="col-span-3 w-full space-y-2">
                              <Input id="name" className="w-full" {...field} />
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tableNumber"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                            <Label htmlFor="tableNumber">{t("chooseTable")}</Label>
                            <div className="col-span-3 w-full space-y-2">
                              <div className="flex items-center gap-4">
                                <div>{t("table")} {field.value}</div>
                                <TablesDialog
                                  onChoose={(table) => {
                                    field.onChange(table.number);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            )}
            {!isNewGuest && (
              <GuestsDialog
                onChoose={(guest) => {
                  setSelectedGuest(guest);
                }}
              />
            )}
            {!isNewGuest && selectedGuest && (
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <Label htmlFor="selectedGuest">{t("chooseGuest")}</Label>
                <div className="col-span-3 w-full gap-4 flex items-center">
                  <div>
                    {selectedGuest.name} (#{selectedGuest.id})
                  </div>
                  <div>{t("table")}: {selectedGuest.tableNumber}</div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center justify-items-start gap-4">
              <Label htmlFor="orderMode">{t("type")}</Label>
              <div className="col-span-3 flex items-center justify-start">
                <Select
                  onValueChange={(val) => setOrderMode(val as OrderMode)}
                  defaultValue={orderMode}
                  value={orderMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại mã QR" />
                  </SelectTrigger>
                  <SelectContent>
                    {OrderModeTypeValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="w-[60%]">
            <Input
              placeholder={t("searchDish")}
              value={searchDish}
              onChange={(event) => setSearchDish(event.target.value)}
              className="max-w-80 mb-4"
            />
            <div className="h-100 overflow-auto grid grid-cols-3 gap-4">
              {menuItemsFiltered
                .filter((item) => item.status !== MenuItemStatus.HIDDEN)
                .map((item) => (
                  <div key={item.id} className={cn("flex flex-col gap-4")}>
                    <div className="shrink-0 relative w-full h-50">
                      <Image
                        src={item.dish.image}
                        alt={item.dish.name}
                        height={100}
                        width={100}
                        unoptimized
                        className="object-cover w-full h-full rounded-md"
                      />
                      {item.status === MenuItemStatus.OUT_OF_STOCK && (
                        <div>
                          <div className="absolute inset-0 z-40 w-full h-50 bg-gray-200 opacity-25 rounded-md"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-md w-full">
                            <span className="p-1 rounded-lg font-semibold text-sm bg-white text-black w-full block text-center">
                              Hết hàng
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[15px] font-semibold">{item.dish.name}</h3>
                      <p className="text-sm font-semibold">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="shrink-0 ml-auto flex justify-center items-center">
                      <Quantity
                        status={item.status}
                        onChange={(value) => handleQuantityChange(item.id, value)}
                        value={orders.find((order) => order.menuItemId === item.id)?.quantity ?? 0}
                      />
                    </div>
                  </div>
                ))}
            </div>

            <DialogFooter>
              <Button className="w-full justify-between" onClick={handleOrder} disabled={orders.length === 0}>
                <span>{t("orderSummary", { count: orders.length })}</span>
                <span>{formatCurrency(totalPrice)}</span>
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
