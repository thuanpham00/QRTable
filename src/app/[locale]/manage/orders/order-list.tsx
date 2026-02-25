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

type OrderItem = GetOrdersResType["data"][0];
const orderTableColumns: ColumnDef<OrderItem>[] = [
  {
    accessorKey: "tableNumber",
    header: "Bàn",
    cell: ({ row }) => <div>{row.original.tableNumber === 100 ? null : row.original.tableNumber}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(String(row.getValue(columnId)), String(filterValue));
    },
  },
  {
    id: "guestName",
    header: "Khách hàng",
    cell: function Cell({ row }) {
      const guest = row.original.guest;
      return (
        <div>
          {!guest && (
            <div>
              <span>Đã bị xóa</span>
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
      return simpleMatchText(row.original.guest?.name ?? "Đã bị xóa", String(filterValue));
    },
  },
  {
    id: "orderMode",
    header: "Hình thức",
    cell: ({ row }) => (
      <div>
        {row.original.orderMode === OrderModeType.DINE_IN ? (
          <div className="p-2 rounded-md bg-green-600 inline-block">Ăn tại quán</div>
        ) : (
          <div className="p-2 rounded-md bg-blue-600 inline-block">Mang đi</div>
        )}
      </div>
    ),
  },
  {
    id: "dishName",
    header: "Món ăn",
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
    header: "Trạng thái",
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
      return (
        <Select
          onValueChange={(value: (typeof OrderStatusValues)[number]) => {
            changeOrderStatus(value);
          }}
          defaultValue={OrderStatus.Pending}
          value={row.getValue("status")}
          disabled={row.original.status === OrderStatus.Rejected || row.original.status === OrderStatus.Paid}
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {OrderStatusValues.map((status) => {
              return (
                <SelectItem key={status} value={status} disabled={status === OrderStatus.Paid}>
                  {getVietnameseOrderStatus(status)}
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
    header: "Người xử lý",
    cell: ({ row }) => <div>{row.original.orderHandler?.name ?? ""}</div>,
  },
  {
    accessorKey: "createdAt",
    header: () => <div>Tạo/Cập nhật</div>,
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
    header: "Hành động",
    cell: function Actions({ row }) {
      const { setOrderIdEdit } = useContext(OrderTableContext);
      const openEditOrder = () => {
        setOrderIdEdit(row.original.id);
      };

      return (
        <div className="">
          <Button size="sm" onClick={openEditOrder} className="bg-blue-500 hover:bg-blue-400 text-white">
            Sửa
          </Button>
        </div>
      );
    },
  },
];

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
        <CardTitle className="text-xl">Đơn hàng</CardTitle>
        <CardDescription>Quản lý đơn hàng</CardDescription>
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
                  <span className="mr-2">Từ</span>
                  <Input
                    type="datetime-local"
                    placeholder="Từ ngày"
                    className="text-sm"
                    value={format(fromDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
                    onChange={(event) => setFromDate(new Date(event.target.value))}
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Đến</span>
                  <Input
                    type="datetime-local"
                    placeholder="Đến ngày"
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
                placeholder="Tên khách"
                value={(table.getColumn("guestName")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("guestName")?.setFilterValue(event.target.value)}
                className="max-w-25"
              />
              <Input
                placeholder="Số bàn"
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
                      : "Trạng thái"}
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
                  {getVietnameseOrderStatus(status)}: {statics.status[status] ?? 0}
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
                  <span>Ăn tại quán</span>
                  <span className="bg-red-500 w-4 h-4 text-center inline-block rounded-full text-xs">
                    {countOrderDineInByTab}
                  </span>
                </TabsTrigger>
                <TabsTrigger value={OrderModeType.TAKE_OUT}>
                  <span>Mang đi</span>
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
                Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong{" "}
                <strong>{orderList.length}</strong> kết quả
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        </OrderTableContext.Provider>
      </CardContent>
    </Card>
  );
}
