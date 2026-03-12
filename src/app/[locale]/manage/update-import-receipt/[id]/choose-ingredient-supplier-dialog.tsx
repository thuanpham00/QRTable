/* eslint-disable react-hooks/incompatible-library */
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { SupplierIngredientListResType } from "@/schemaValidations/supplierIngredient.schema";
import { useTranslations } from "next-intl";
import { useGetListSupplyBySupplierQuery } from "@/queries/useSupply";
import { simpleMatchText } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { PlusCircle } from "lucide-react";

type SupplyItem = SupplierIngredientListResType["data"][0];

const getColumns = (t: (key: string) => string): ColumnDef<SupplyItem>[] => [
  {
    accessorKey: "id",
    header: "ID",
    size: 60,
    cell: ({ row }) => <div className="text-center">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "ingredient",
    header: t("ingredientName"),
    size: 200,
    cell: ({ row }) => {
      const ingredient = row.original.ingredient;
      return (
        <div className="font-medium">
          {ingredient?.name || "—"}
          {ingredient?.category && (
            <span className="text-xs text-muted-foreground ml-2">({ingredient.category})</span>
          )}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(String(row.original.ingredient?.name), String(filterValue));
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">{t("price")}</div>,
    size: 130,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.getValue("price"))}
      </div>
    ),
  },
  {
    accessorKey: "isPreferred",
    header: t("preferred"),
    size: 100,
    cell: ({ row }) =>
      row.getValue("isPreferred") ? (
        <Badge className="bg-yellow-100 text-black">⭐ {t("yes")}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">{t("no")}</span>
      ),
  },
  {
    accessorKey: "note",
    header: t("note"),
    size: 200,
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground truncate max-w-50">{row.getValue("note") || "—"}</div>
    ),
  },
];

const PAGE_SIZE = 10;
export default function ChooseIngredientSupplierDialog({
  supplierId,
  onChoose,
}: {
  supplierId: number;
  onChoose: (value: SupplyItem) => void;
}) {
  const t = useTranslations("ManageImportReceipts");
  const columns = getColumns(t as (key: string) => string);

  const listGuestsQuery = useGetListSupplyBySupplierQuery({
    supplierId: supplierId as number,
    enabled: Boolean(supplierId),
  });

  const data: SupplierIngredientListResType["data"] = listGuestsQuery.data?.payload.data || [];

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
    if (supplierId) {
      table.setPagination({
        pageIndex: 0,
        pageSize: PAGE_SIZE,
      });
    }
  }, [supplierId, table]);

  const supplierName = data[0]?.supplier?.name || "Nhà cung cấp";

  const [showModalChooseIngredient, setShowModalChooseIngredient] = useState<boolean>(false);

  const choose = (supply: SupplyItem) => {
    onChoose(supply); // chuyển dữ liệu từ child lên parent thông qua hàm onChoose (props)
    setShowModalChooseIngredient(false);
  };

  return (
    <Dialog open={showModalChooseIngredient} onOpenChange={setShowModalChooseIngredient}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1 w-40">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{t("chooseIngredient")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-225 flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t("chooseIngredient")} từ {supplierName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <Input
                placeholder={t("searchIngredient")}
                value={(table.getColumn("ingredient")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("ingredient")?.setFilterValue(event.target.value)}
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
