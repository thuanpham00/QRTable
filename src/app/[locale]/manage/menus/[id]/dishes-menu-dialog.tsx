/* eslint-disable react-hooks/incompatible-library */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DishListResType } from "@/schemaValidations/dish.schema";
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
import { formatCurrency, getVietnameseDishStatus, simpleMatchText } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useGetListDishQuery } from "@/queries/useDish";
import { DishStatus } from "@/constants/type";

export type DishItem = DishListResType["data"][0];
export const columns: ColumnDef<DishItem>[] = [
  {
    id: "stt",
    header: "STT",
    cell: ({ row }) => <div className="font-medium">#{row.original.id}</div>,
  },
  {
    id: "dishName",
    header: "Món ăn",
    cell: ({ row }) => (
      <div className="flex items-center space-x-4">
        <Image
          src={row.original.image}
          alt={row.original.name}
          width={50}
          height={50}
          className="rounded-md object-cover w-12.5 h-12.5"
        />
        <span>{row.original.name}</span>
      </div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(String(row.original.name), String(filterValue));
    },
  },
  {
    accessorKey: "price",
    header: "Giá cả",
    cell: ({ row }) => <div className="capitalize">{formatCurrency(row.getValue("price"))}</div>,
  },
  {
    accessorKey: "category",
    header: "Danh mục",
    cell: ({ row }) => <div className="capitalize">{row.original.category.name}</div>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <div>{getVietnameseDishStatus(row.getValue("status"))}</div>,
  },
];

const PAGE_SIZE = 10;
export default function DishesMenuDialog({
  onChoose,
  listIdDish,
}: {
  onChoose: (dish: DishItem) => void;
  listIdDish: number[];
}) {
  const [open, setOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const listDishQuery = useGetListDishQuery({
    pagination: "false",
    page: 1,
    limit: 5, // nếu pagination = false thì page và limit không có ý nghĩa
  });
  const data =
    listDishQuery.data?.payload.data.filter((item) => item.status !== DishStatus.Discontinued) || [];
  const dataFiltered = data.filter((dish) => !listIdDish.includes(dish.id)); // lọc những món đã có trong menu

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

  const choose = (dish: DishItem) => {
    onChoose(dish); // chuyển dữ liệu từ child lên parent thông qua hàm onChoose (props)
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Thay đổi</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-230">
        <DialogHeader>
          <DialogTitle>Chọn món ăn</DialogTitle>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="flex items-center py-4">
              <Input
                placeholder="Lọc tên"
                value={(table.getColumn("dishName")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("dishName")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            </div>

            <span className="block pb-4 text-sm italic">
              Lưu ý*: Món ăn đã có trong menu sẽ không hiển thị trong danh sách này.
            </span>

            <div className="rounded-md border h-75 overflow-auto">
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
                        onClick={() => choose(row.original)}
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
