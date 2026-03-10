/* eslint-disable react-hooks/incompatible-library */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useContext, useEffect, useState } from "react";
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
import { simpleMatchText } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useGetListNotLinkedSupplier } from "@/queries/useSupply";
import { SupplierTableContext } from "@/app/[locale]/manage/suppliers/supplier-table";
import { IngredientResType } from "@/schemaValidations/ingredient.schema";

export type IngredientItem = IngredientResType["data"];

const getColumns = (t: (key: string) => string): ColumnDef<IngredientItem>[] => [
  {
    accessorKey: "id",
    header: "ID",
    size: 60,
    cell: ({ row }) => <div className="text-left">#{row.getValue("id")}</div>,
  },
  {
    accessorKey: "image",
    header: t("imageHeader"),
    size: 80,
    cell: ({ row }) => (
      <Image
        src={row.getValue("image")}
        alt={row.original.name}
        width={50}
        height={50}
        className="rounded-md object-cover w-12.5 h-12.5"
      />
    ),
  },
  {
    accessorKey: "name",
    header: t("nameHeader"),
    size: 200,
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("name")}
        {row.original.category && (
          <div className="text-xs text-muted-foreground">{row.original.category}</div>
        )}
      </div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(String(row.original.name), String(filterValue));
    },
  },
  {
    accessorKey: "isVegetarian",
    header: t("dietaryHeader"),
    size: 120,
    cell: ({ row }) => (
      <div className="text-xs">
        {row.original.isVegan && <div className="text-green-600">🌱 {t("vegan")}</div>}
        {row.original.isVegetarian && !row.original.isVegan && (
          <div className="text-green-500">🥬 {t("vegetarian")}</div>
        )}
        {row.original.allergenType && <div className="text-orange-500">⚠️ {row.original.allergenType}</div>}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: t("statusHeader"),
    size: 100,
    cell: ({ row }) => <div>{row.getValue("isActive") ? t("active") : t("inactive")}</div>,
  },
];

const PAGE_SIZE = 10;
export function IngredientDialog({ onChoose }: { onChoose: (ingredient: IngredientItem) => void }) {
  const { supplierIdEdit } = useContext(SupplierTableContext);
  const t = useTranslations("ManageSupplies");
  const columns = getColumns(t as (key: string) => string);
  const [open, setOpen] = useState(false);

  const listNotLinkedSupplier = useGetListNotLinkedSupplier({
    supplierId: supplierIdEdit as number,
    enabled: Boolean(supplierIdEdit),
  });

  const data = listNotLinkedSupplier.data?.payload.data || [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const table = useReactTable({
    data,
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

  const choose = (ingredient: IngredientItem) => {
    onChoose(ingredient); // chuyển dữ liệu từ child lên parent thông qua hàm onChoose (props)
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("addIngredient")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-225 flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("selectIngredient")}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <div className="w-full">
            <div className="flex items-center py-4">
              <Input
                placeholder={t("searchIngredientByName")}
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border max-h-90 overflow-auto">
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
                          choose(row.original);
                        }}
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
                {t("showingOf", { count: table.getPaginationRowModel().rows.length, total: data.length })}
              </div>
              <div className="space-x-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
