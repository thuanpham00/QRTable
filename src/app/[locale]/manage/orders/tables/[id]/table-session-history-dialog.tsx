/* eslint-disable react-hooks/incompatible-library */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGetListTableSessionHistoryQuery } from "@/queries/useTable";
import { TableSessionSchemaType } from "@/schemaValidations/tableSessions.schema";
import { formatCurrency, formatDateTimeToLocaleString } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useContext, useState } from "react";
import { intervalToDuration } from "date-fns";
import { OrderByTableContext } from "@/app/[locale]/manage/orders/tables/[id]/page";

const getSessionStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Hoàn thành</Badge>;
    case "Cancelled":
      return <Badge variant="destructive">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper function để format thời lượng
const formatSessionDuration = (startTime: Date, endTime: Date | null) => {
  if (!endTime) return "Đang phục vụ";

  const duration = intervalToDuration({
    start: startTime,
    end: endTime,
  });

  const parts: string[] = [];
  if (duration.hours) parts.push(`${duration.hours}h`);
  if (duration.minutes) parts.push(`${duration.minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "< 1m";
};

const columns: ColumnDef<TableSessionSchemaType>[] = [
  {
    id: "stt",
    header: "STT",
    cell: ({ row }) => <div className="text-left">{row.original.id}</div>,
  },
  {
    accessorKey: "startTime",
    header: "Thời gian bắt đầu",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{formatDateTimeToLocaleString(row.getValue("startTime"))}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "endTime",
    header: "Thời gian kết thúc",
    cell: ({ row }) => {
      const endTime = row.getValue("endTime") as Date | null;
      return (
        <div className="whitespace-nowrap">
          {endTime ? formatDateTimeToLocaleString(endTime) : <span className="text-muted-foreground">-</span>}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "duration",
    header: "Thời lượng",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {formatSessionDuration(row.original.startTime, row.original.endTime)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => getSessionStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "guestCount",
    header: () => <div className="text-center">Số khách</div>,
    cell: ({ row }) => <div className="text-center">{row.original.guests.length}</div>,
  },
  {
    accessorKey: "orderCount",
    header: () => <div className="text-center">Số món</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("orderCount")}</div>,
  },
  {
    accessorKey: "totalRevenue",
    header: () => <div className="text-right">Doanh thu</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{formatCurrency(row.getValue("totalRevenue"))}</div>
    ),
  },
  {
    accessorKey: "Actions",
    header: () => <div className="text-right">Hành động</div>,
    cell: function Action({ row }) {
      const { setTableSessionId } = useContext(OrderByTableContext);
      return (
        <div className="text-right">
          <Button variant="default" size="sm" onClick={() => setTableSessionId(row.original.id)}>
            Chi tiết
          </Button>
        </div>
      );
    },
  },
];

export default function TableSessionHistoryDialog({
  showModalHistoryTableSession,
  setShowModalHistoryTableSession,
}: {
  showModalHistoryTableSession: number | null;
  setShowModalHistoryTableSession: (value: number | null) => void;
}) {
  const listTableSessionHistory = useGetListTableSessionHistoryQuery({
    tableNumber: Number(showModalHistoryTableSession),
    enable: Boolean(showModalHistoryTableSession),
  });
  const data = listTableSessionHistory.data?.payload.data || [];

  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: 10, //default page size
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      rowSelection,
      pagination,
    },
  });

  return (
    <Dialog
      open={showModalHistoryTableSession !== null}
      onOpenChange={(open) => setShowModalHistoryTableSession(open ? showModalHistoryTableSession : null)}
    >
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Lịch sử phiên bàn</DialogTitle>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="rounded-md border h-90 overflow-auto">
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
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-pointer"
                      >
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
                Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong{" "}
                <strong>{data.length}</strong> kết quả
              </div>
              <div className="space-x-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
