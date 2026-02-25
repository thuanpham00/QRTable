/* eslint-disable react-hooks/incompatible-library */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  ColumnDef,
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
import { cn, getVietnameseTableStatus, simpleMatchText } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TableListResType } from "@/schemaValidations/table.schema";
import { OrderModeType, TableStatus } from "@/constants/type";
import { useGetListTableQuery } from "@/queries/useTable";

type TableItem = TableListResType["data"][0];

export const columns: ColumnDef<TableItem>[] = [
  {
    accessorKey: "number",
    header: "Số bàn",
    cell: ({ row }) => <div className="capitalize">{row.getValue("number")}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(String(row.original.number), String(filterValue));
    },
  },
  {
    accessorKey: "capacity",
    header: "Sức chứa",
    cell: ({ row }) => <div className="capitalize">{row.getValue("capacity")}</div>,
  },
  {
    accessorKey: "typeQR",
    header: "Loại QR",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("typeQR") === OrderModeType.DINE_IN ? "Ăn tại bàn" : "Mang đi"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <div>{getVietnameseTableStatus(row.getValue("status"))}</div>,
  },
];

const PAGE_SIZE = 10;

export function TablesDialog({ onChoose }: { onChoose: (table: TableItem) => void }) {
  const [open, setOpen] = useState(false);
  const listTableQuery = useGetListTableQuery({
    page: 1,
    limit: 5, // ko phân trang, lấy hết bàn
    pagination: "false",
  });
  const data: TableListResType["data"] = listTableQuery.data?.payload.data || [];
  const dataFiltered = data
    .filter((table) => table.status !== TableStatus.Hidden)
    .sort((a, b) => {
      if (a.typeQR === OrderModeType.DINE_IN && b.typeQR === OrderModeType.TAKE_OUT) {
        return -1;
      }
      if (a.typeQR === OrderModeType.TAKE_OUT && b.typeQR === OrderModeType.DINE_IN) {
        return 1;
      }
      return 0;
    });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const table = useReactTable({
    data: dataFiltered,
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
      pageIndex: 0,
      pageSize: PAGE_SIZE,
    });
  }, [table]);

  const choose = (table: TableItem) => {
    onChoose(table); // chuyển dữ liệu từ child lên parent thông qua hàm onChoose (props)
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Thay đổi</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>Chọn bàn</DialogTitle>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="flex items-center py-4">
              <Input
                placeholder="Số bàn"
                value={(table.getColumn("number")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("number")?.setFilterValue(event.target.value)}
                className="w-20"
              />
            </div>
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
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => {
                          if (
                            row.original.status === TableStatus.Available ||
                            row.original.status === TableStatus.Serving
                          ) {
                            choose(row.original);
                          }
                        }}
                        className={cn({
                          "cursor-pointer":
                            row.original.status === TableStatus.Available ||
                            row.original.status === TableStatus.Serving,
                          "cursor-not-allowed": row.original.status === TableStatus.Hidden,
                        })}
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
                <strong>{dataFiltered.length}</strong> kết quả
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
