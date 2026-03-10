/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  GetOrdersResType,
  PayGuestOrdersResType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import AddOrder from "@/app/[locale]/manage/orders/add-order";
import EditOrder from "@/app/[locale]/manage/orders/edit-order";
import { createContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getVietnameseOrderStatus, handleErrorApi } from "@/lib/utils";
import { OrderMode, OrderModeType, OrderStatusType, OrderStatusValues } from "@/constants/type";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { endOfDay, format, startOfDay } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContext } from "react";
import { formatCurrency, formatDateTimeToLocaleString, simpleMatchText } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/constants/type";
import { useUpdateOrderMutation } from "@/queries/useOrder";
import TableSkeleton from "@/app/[locale]/manage/orders/table-skeleton";
import { toast } from "sonner";
import { GuestCreateOrdersResType } from "@/schemaValidations/guest.schema";
import { useAppStore } from "@/components/app-provider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Statics } from "@/app/[locale]/manage/orders/order-table-session";
import { useTranslations } from "next-intl";

const OrderTableContext = createContext({
  orderIdEdit: undefined as number | undefined,
  setOrderIdEdit: (value: number | undefined) => {},
  changeStatus: (payload: {
    orderId: number;
    menuItemId: number;
    quantity: number;
    status: (typeof OrderStatusValues)[number];
  }) => {},
});

function checkStatusOrder(statusOrder: string): Record<string, boolean> {
  switch (statusOrder) {
    case OrderStatus.Pending:
      return {
        [OrderStatus.Pending]: true,
        [OrderStatus.Processing]: false,
        [OrderStatus.Rejected]: false,
        [OrderStatus.Delivered]: true,
        [OrderStatus.Paid]: true,
      };
    case OrderStatus.Processing:
      return {
        [OrderStatus.Pending]: true,
        [OrderStatus.Processing]: true,
        [OrderStatus.Rejected]: true,
        [OrderStatus.Delivered]: false,
        [OrderStatus.Paid]: true,
      };
    case OrderStatus.Paid:
    case OrderStatus.Rejected:
    case OrderStatus.Delivered:
      return {
        [OrderStatus.Pending]: true,
        [OrderStatus.Processing]: true,
        [OrderStatus.Rejected]: true,
        [OrderStatus.Delivered]: true,
        [OrderStatus.Paid]: true,
      };

    default:
      return {};
  }
}

type OrderItem = GetOrdersResType["data"][0];
const getColumns = (t: any) => {
  const orderTableColumns: ColumnDef<OrderItem>[] = [
    {
      accessorKey: "tableNumber",
      header: t("tableNumberHeader"),
      cell: ({ row }) => <div>{row.original.tableNumber === 100 ? null : row.original.tableNumber}</div>,
      filterFn: (row, columnId, filterValue: string) => {
        if (filterValue === undefined) return true;
        return simpleMatchText(String(row.getValue(columnId)), String(filterValue));
      },
    },
    {
      id: "guestName",
      header: t("guestNameHeader"),
      cell: function Cell({ row }) {
        const guest = row.original.guest;
        return (
          <div>
            {!guest && (
              <div>
                <span>{t("deletedGuest")}</span>
              </div>
            )}
            {guest && (
              <div>
                <span>{guest.name}</span>
                <span className="font-semibold ml-1">(#{guest.id})</span>
              </div>
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue: string) => {
        if (filterValue === undefined) return true;
        return simpleMatchText(row.original.guest?.name ?? t("deletedGuest"), String(filterValue));
      },
    },
    {
      id: "orderMode",
      header: t("orderModeHeader"),
      cell: ({ row }) => (
        <div>
          {row.original.orderMode === OrderModeType.DINE_IN ? (
            <div className="p-2 rounded-md bg-green-600 inline-block">{t("dineIn")}</div>
          ) : (
            <div className="p-2 rounded-md bg-blue-600 inline-block">{t("takeOut")}</div>
          )}
        </div>
      ),
    },
    {
      id: "dishName",
      header: t("dishNameHeader"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Image
                src={row.original.dishSnapshot.image}
                alt={row.original.dishSnapshot.name}
                width={50}
                height={50}
                className="rounded-md object-cover w-12.5 h-12.5 cursor-pointer"
              />
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-wrap gap-2">
                <Image
                  src={row.original.dishSnapshot.image}
                  alt={row.original.dishSnapshot.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover w-25 h-25"
                />
                <div className="space-y-1 text-sm">
                  <h3 className="font-semibold">{row.original.dishSnapshot.name}</h3>
                  <div className="italic">{formatCurrency(row.original.dishSnapshot.price)}</div>
                  <div>{row.original.dishSnapshot.description}</div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>{row.original.dishSnapshot.name}</span>
              <Badge className="px-1" variant={"secondary"}>
                x{row.original.quantity}
              </Badge>
            </div>
            <span className="italic">
              {formatCurrency(row.original.dishSnapshot.price * row.original.quantity)}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("statusHeader"),
      cell: function Cell({ row }) {
        const { changeStatus } = useContext(OrderTableContext);
        const changeOrderStatus = async (status: (typeof OrderStatusValues)[number]) => {
          changeStatus({
            orderId: row.original.id,
            menuItemId: row.original.dishSnapshot.menuItemId!,
            status: status,
            quantity: row.original.quantity,
          });
        };
        const listStatusOrderActive = checkStatusOrder(row.original.status);
        return (
          <Select
            onValueChange={(value: (typeof OrderStatusValues)[number]) => {
              changeOrderStatus(value);
            }}
            defaultValue={OrderStatus.Pending}
            value={row.getValue("status")}
            disabled={
              row.original.status === OrderStatus.Rejected || row.original.status === OrderStatus.Paid
            }
          >
            <SelectTrigger className="w-35">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {}
              {Object.entries(listStatusOrderActive).map(([key, status]) => {
                console.log(key, status);
                // nếu chờ xử lý thì cho phép "Đang nấu" hoặc "Từ chối"
                // nếu "Đang nấu" thì cho phép "Đã phục vụ"
                // nếu "Đã phục vụ thì cho phép "Thanh toán"
                return (
                  <SelectItem key={key} value={key} disabled={status}>
                    {getVietnameseOrderStatus(key as (typeof OrderStatusValues)[number])}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      },
    },

    {
      id: "orderHandlerName",
      header: t("orderHandlerHeader"),
      cell: ({ row }) => <div>{row.original.orderHandler?.name ?? ""}</div>,
    },
    {
      accessorKey: "createdAt",
      header: () => <div>{t("createdUpdatedAtHeader")}</div>,
      cell: ({ row }) => (
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-4">
            {formatDateTimeToLocaleString(row.getValue("createdAt"))}
          </div>
          <div className="flex items-center space-x-4">
            {formatDateTimeToLocaleString(row.original.updatedAt as unknown as string)}
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: t("actionsHeader"),
      cell: function Actions({ row }) {
        const { setOrderIdEdit } = useContext(OrderTableContext);
        const openEditOrder = () => {
          setOrderIdEdit(row.original.id);
        };

        return (
          <div className="">
            <Button
              size="sm"
              onClick={openEditOrder}
              disabled={
                row.original.status === OrderStatus.Rejected || row.original.status === OrderStatus.Paid
              }
              className="bg-blue-500 hover:bg-blue-400 text-white"
            >
              {t("editButton")}
            </Button>
          </div>
        );
      },
    },
  ];
  return orderTableColumns;
};

const PAGE_SIZE = 10;
const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());

export default function OrderList({
  orderList,
  refetch,
  isPending,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  statics,
  countOrderDineInByTab,
  countOrderTakeOutByTab,
}: {
  orderList: GetOrdersResType["data"];
  refetch: () => void;
  isPending: boolean;
  fromDate: Date;
  toDate: Date;
  setFromDate: (date: Date) => void;
  setToDate: (date: Date) => void;
  statics: Statics;
  countOrderDineInByTab: number;
  countOrderTakeOutByTab: number;
}) {
  const t = useTranslations("ManageOrders");
  const orderTableColumns = getColumns(t);

  const socket = useAppStore((state) => state.socket);
  const [selectedTab, setSelectedTab] = useState<OrderMode>(OrderModeType.DINE_IN);
  const [openStatusFilter, setOpenStatusFilter] = useState(false);

  const [orderIdEdit, setOrderIdEdit] = useState<number | undefined>();

  const searchParam = useSearchParams();

  const page = searchParam.get("page") ? Number(searchParam.get("page")) : 1;
  const pageIndex = page - 1;

  const updateOrderMutation = useUpdateOrderMutation();

  const orderListFilteredByTab = orderList.filter((order) => order.orderMode === selectedTab);

  // state mặc định của table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const resetDateFilter = () => {
    setFromDate(initFromDate);
    setToDate(initToDate);
  };

  const table = useReactTable({
    data: orderListFilteredByTab,
    columns: orderTableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const changeStatus = async (body: {
    orderId: number;
    menuItemId: number;
    status: (typeof OrderStatusValues)[number];
    quantity: number;
  }) => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId: body.orderId,
        body: {
          menuItemId: body.menuItemId,
          quantity: body.quantity,
          status: body.status,
        },
      });
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    });
  }, [table, pageIndex]);

  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }

    function onConnect() {
      console.log(socket?.id);
    }

    function onDisconnect() {
      console.log("disconnected");
    }

    function refetchList() {
      const now = new Date();
      if (fromDate <= now && toDate >= now) {
        refetch();
      }
    }

    function onUpdateOrder(data: UpdateOrderResType["data"]) {
      const {
        dishSnapshot: { name },
        quantity,
        status,
      } = data;

      toast.success(
        `Món ${name} (SL: ${quantity}) vừa được cập nhật sang trạng thái ${getVietnameseOrderStatus(status)}`,
        { duration: 4000 },
      );
      refetchList();
    }

    function onNewOrder(data: GuestCreateOrdersResType["data"]) {
      toast.success(`Khách hàng ${data[0].guest?.name} (bàn ${data[0].tableNumber}) vừa tạo đơn hàng mới`, {
        duration: 4000,
      });
      refetchList();
    }

    function onPayment(data: PayGuestOrdersResType["data"]) {
      toast.success(
        `Khách hàng ${data[0].guest?.name} (bàn ${data[0].tableNumber}) thanh toán thành công ${data.length} đơn`,
        {
          duration: 4000,
        },
      );
      refetchList();
    }

    socket?.on("update-order", onUpdateOrder);
    socket?.on("new-order", onNewOrder);
    socket?.on("payment", onPayment);

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("update-order", onUpdateOrder);
      socket?.off("new-order", onNewOrder);
      socket?.off("payment", onPayment);
    };
  }, [refetch, fromDate, toDate, socket]);

  return (
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader>
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <OrderTableContext.Provider
          value={{
            orderIdEdit,
            setOrderIdEdit,
            changeStatus,
          }}
        >
          <div className="w-full">
            <EditOrder id={orderIdEdit} setId={setOrderIdEdit} />
            <div className=" flex items-center">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <span className="mr-2">{t("fromLabel")}</span>
                  <Input
                    type="datetime-local"
                    placeholder={t("fromDatePlaceholder")}
                    className="text-sm"
                    value={format(fromDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
                    onChange={(event) => setFromDate(new Date(event.target.value))}
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2">{t("toLabel")}</span>
                  <Input
                    type="datetime-local"
                    placeholder={t("toDatePlaceholder")}
                    value={format(toDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
                    onChange={(event) => setToDate(new Date(event.target.value))}
                  />
                </div>
                <Button className="" variant={"outline"} onClick={resetDateFilter}>
                  Reset
                </Button>
              </div>
              <div className="ml-auto">
                <AddOrder />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 py-4">
              <Input
                placeholder={t("filterGuestName")}
                value={(table.getColumn("guestName")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("guestName")?.setFilterValue(event.target.value)}
                className="max-w-25"
              />
              <Input
                placeholder={t("filterTableNumber")}
                value={(table.getColumn("tableNumber")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("tableNumber")?.setFilterValue(event.target.value)}
                className="max-w-20"
              />
              <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStatusFilter}
                    className="w-37.5 text-sm justify-between"
                  >
                    {table.getColumn("status")?.getFilterValue()
                      ? getVietnameseOrderStatus(
                          table.getColumn("status")?.getFilterValue() as (typeof OrderStatusValues)[number],
                        )
                      : t("statusFilter")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 p-0">
                  <Command>
                    <CommandGroup>
                      <CommandList>
                        {OrderStatusValues.map((status) => (
                          <CommandItem
                            key={status}
                            value={status}
                            onSelect={(currentValue: any) => {
                              table
                                .getColumn("status")
                                ?.setFilterValue(
                                  currentValue === table.getColumn("status")?.getFilterValue()
                                    ? ""
                                    : currentValue,
                                );
                              setOpenStatusFilter(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                table.getColumn("status")?.getFilterValue() === status
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {getVietnameseOrderStatus(status)}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-start items-end gap-4 flex-wrap py-4">
              {OrderStatusValues.map((status) => (
                <Badge variant="secondary" key={status}>
                  {t(status)}: {statics.status[status] ?? 0}
                </Badge>
              ))}
            </div>

            <Tabs
              value={selectedTab}
              onValueChange={(val) => setSelectedTab(val as OrderMode)}
              className="mb-4"
            >
              <TabsList variant="default">
                <TabsTrigger value={OrderModeType.DINE_IN}>
                  <span>{t("dineIn")}</span>
                  <span className="bg-red-500 w-4 h-4 text-center inline-block rounded-full text-xs">
                    {countOrderDineInByTab}
                  </span>
                </TabsTrigger>
                <TabsTrigger value={OrderModeType.TAKE_OUT}>
                  <span>{t("takeOut")}</span>
                  <span className="bg-red-500 w-4 h-4 text-center inline-block rounded-full text-xs">
                    {countOrderTakeOutByTab}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isPending && <TableSkeleton />}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={orderTableColumns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-xs text-muted-foreground py-4 flex-1 ">
                {t("showingOf", {
                  count: table.getPaginationRowModel().rows.length,
                  total: orderList.length,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {t("previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {t("next")}
                </Button>
              </div>
            </div>
          </div>
        </OrderTableContext.Provider>
      </CardContent>
    </Card>
  );
}
