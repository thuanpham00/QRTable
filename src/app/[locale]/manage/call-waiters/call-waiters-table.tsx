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
import { createContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getVietnameseGuestCallStatus, handleErrorApi } from "@/lib/utils";
import { GuestCallStatus, GuestCallStatusType, GuestCallValues } from "@/constants/type";
import { Check, ChevronsUpDown, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { endOfDay, format, startOfDay } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { formatDateTimeToLocaleString, simpleMatchText } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import TableSkeleton from "@/app/[locale]/manage/orders/table-skeleton";
import { useAppStore } from "@/components/app-provider";
import { useGetGuestCallListQuery, useUpdateStatusGuestCallMutation } from "@/queries/useGuestCall";
import { GuestCallListResType } from "@/schemaValidations/guest-call.schema";
import { string } from "zod";
import { useTranslations } from "next-intl";

const WaiterTableContext = createContext({
  changeStatus: (payload: { idGuestCall: string; status: GuestCallStatusType }) => {},
});

type GuestCallItem = GuestCallListResType["data"][0];
const getColumns = (t: any) => {
  const waiterTableColumns: ColumnDef<GuestCallItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "tableNumber",
      header: t("tableNumber"),
      cell: ({ row }) => <div>{row.getValue("tableNumber")}</div>,
      filterFn: (row, columnId, filterValue: string) => {
        if (filterValue === undefined) return true;
        return simpleMatchText(String(row.getValue(columnId)), String(filterValue));
      },
    },
    {
      id: "guestId",
      header: t("guestId"),
      cell: ({ row }) => <div>#{row.original.guestId}</div>,
      filterFn: (row, columnId, filterValue: string) => {
        if (filterValue === undefined) return true;
        return simpleMatchText(String(row.original.guestId), String(filterValue));
      },
    },
    {
      id: "guestName",
      header: t("guestName"),
      cell: ({ row }) => <div>{row.original.guest.name}</div>,
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: function Cell({ row }) {
        return (
          <div>
            <Badge
              variant={
                row.getValue("status") === GuestCallStatus.Completed
                  ? "default"
                  : row.getValue("status") === GuestCallStatus.Rejected
                    ? "destructive"
                    : "secondary"
              }
            >
              {getVietnameseGuestCallStatus(row.getValue("status"))}
            </Badge>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue: string) => {
        if (filterValue === undefined) return true;
        return row.getValue(columnId) === filterValue;
      },
    },
    {
      accessorKey: "accountId",
      header: t("accountId"),
      cell: ({ row }) => {
        const accountId = row.getValue("accountId");
        return <div>{accountId ? `${row.original.account?.name}` : t("notProcessed")}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: () => <div>{t("createdUpdatedAt")}</div>,
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
      header: t("actions"),
      cell: function Actions({ row }) {
        const { changeStatus } = useContext(WaiterTableContext);
        const openEditGuestCall = (valueStatus: string) => {
          changeStatus({
            idGuestCall: row.original.id.toString(),
            status: valueStatus as GuestCallStatusType,
          });
        };

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={row.original.status !== GuestCallStatus.Pending}
              onClick={() => openEditGuestCall(GuestCallStatus.Completed)}
              className="bg-blue-500 hover:bg-blue-400 text-white"
            >
              {t("process")}
            </Button>{" "}
            <Button
              size="sm"
              disabled={row.original.status !== GuestCallStatus.Pending}
              onClick={() => openEditGuestCall(GuestCallStatus.Rejected)}
              className="bg-red-500 hover:bg-red-400 text-white"
            >
              {t("reject")}
            </Button>
          </div>
        );
      },
    },
  ];
  return waiterTableColumns;
};

const PAGE_SIZE = 10;
const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());
export default function CallWaitersTable() {
  const t = useTranslations("ManageCallWaiters");
  const columns = getColumns(t);

  const socket = useAppStore((state) => state.socket);

  const searchParam = useSearchParams();
  const [openStatusFilter, setOpenStatusFilter] = useState(false);

  const [fromDate, setFromDate] = useState(initFromDate);
  const [toDate, setToDate] = useState(initToDate);

  const page = searchParam.get("page") ? Number(searchParam.get("page")) : 1;
  const pageIndex = page - 1;

  const { data, refetch, isPending } = useGetGuestCallListQuery({
    fromDate: fromDate,
    toDate: toDate,
  }); // fetch order list ngày hôm nay (mặc định)
  const guestCallList: GuestCallListResType["data"] = data?.payload.data ?? [];

  // state mặc định của table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const table = useReactTable({
    data: guestCallList,
    columns,
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

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    });
  }, [table, pageIndex]);

  const resetDateFilter = () => {
    setFromDate(initFromDate);
    setToDate(initToDate);
  };

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

    function onGuestCallListener() {
      refetchList();
    }

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("count-call-waiter", onGuestCallListener);

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("count-call-waiter", onGuestCallListener);
    };
  }, [refetch, fromDate, toDate, socket]);

  const updateStatusGuestCall = useUpdateStatusGuestCallMutation();

  const changeStatus = ({ idGuestCall, status }: { idGuestCall: string; status: GuestCallStatusType }) => {
    // logic change status guest call
    try {
      updateStatusGuestCall.mutate({ idGuestCall, status });
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  return (
    <WaiterTableContext.Provider
      value={{
        changeStatus,
      }}
    >
      <div className="w-full">
        <div className="flex items-center justify-between py-4 flex-wrap">
          <div className="flex items-center flex-wrap gap-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm">{t("from")}</span>
              <Input
                type="datetime-local"
                placeholder={t("fromDate")}
                className="text-sm"
                value={format(fromDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
                onChange={(event) => setFromDate(new Date(event.target.value))}
              />
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-sm">{t("to")}</span>
              <Input
                type="datetime-local"
                placeholder={t("toDate")}
                value={format(toDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
                onChange={(event) => setToDate(new Date(event.target.value))}
              />
            </div>

            <div className="flex items-center">
              <span className="mr-2 text-sm">{t("guestId")}</span>
              <Input
                placeholder={t("filterGuestId")}
                value={(table.getColumn("guestId")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("guestId")?.setFilterValue(event.target.value)}
                className="max-w-25"
              />
            </div>

            <div className="flex items-center">
              <span className="mr-2 text-sm">{t("tableNumber")}</span>
              <Input
                placeholder={t("filterTableNumber")}
                value={(table.getColumn("tableNumber")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("tableNumber")?.setFilterValue(event.target.value)}
                className="max-w-20"
              />
            </div>
            <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openStatusFilter}
                  className="w-37.5 text-sm justify-between"
                >
                  {table.getColumn("status")?.getFilterValue()
                    ? getVietnameseGuestCallStatus(
                        table.getColumn("status")?.getFilterValue() as (typeof GuestCallValues)[number],
                      )
                    : t("statusFilter")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-50 p-0">
                <Command>
                  <CommandGroup>
                    <CommandList>
                      {GuestCallValues.map((status) => (
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
                          {getVietnameseGuestCallStatus(status)}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Button className="" variant={"outline"} onClick={resetDateFilter}>
              Reset
            </Button>
          </div>

          <div>
            <Button variant="outline" className="bg-red-500! hover:bg-red-600!" onClick={() => refetch()}>
              <RefreshCcw />
            </Button>
          </div>
        </div>

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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
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
              total: guestCallList.length,
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
    </WaiterTableContext.Provider>
  );
}
