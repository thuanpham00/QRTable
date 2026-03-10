/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createContext, useContext, useEffect, useState } from "react";
import { SupplierIngredientListResType } from "@/schemaValidations/supplierIngredient.schema";
import { useTranslations } from "next-intl";
import { useGetListSupplyBySupplierQuery } from "@/queries/useSupply";
import { simpleMatchText } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import AddSupply from "@/app/[locale]/manage/suppliers/add-supply";
import { SupplierTableContext } from "@/app/[locale]/manage/suppliers/supplier-table";

type SupplyItem = SupplierIngredientListResType["data"][0];


// sử dụng trong phạm vị component SupplierTable và các component con của nó
export const SupplyTableContext = createContext<{
  setSupplyIdEdit: (value: number | undefined) => void;
  supplyIdEdit: number | undefined;
  supplyDelete: SupplyItem | null;
  setSupplyDelete: (value: SupplyItem | null) => void;
}>({
  setSupplyIdEdit: (value: number | undefined) => {},
  supplyIdEdit: undefined,
  supplyDelete: null,
  setSupplyDelete: (value: SupplyItem | null) => {},
});

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
  {
    accessorKey: "createdAt",
    header: t("createdAt"),
    size: 150,
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.getValue("createdAt")).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    ),
  },
  {
    id: "actions",
    header: t("actions"),
    cell: function Actions({ row }) {
      const t = useTranslations("ManageSupplies");
      const { setSupplyIdEdit, setSupplyDelete } = useContext(SupplyTableContext);
      const openEditSupply = () => {
        setSupplyIdEdit(row.original.id);
      };

      const openDeleteSupply = () => {
        setSupplyDelete(row.original);
      };

      return (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openEditSupply} className="bg-blue-500 hover:bg-blue-400 text-white">
            {t("edit")}
          </Button>
          <Button size="sm" onClick={openDeleteSupply} className="bg-red-500 hover:bg-red-400 text-white">
            {t("delete")}
          </Button>
        </div>
      );
    },
  },
];

const PAGE_SIZE = 10;
export default function DialogShowSupplyBySupplier() {
  const { supplierIdEdit, setSupplierIdEdit } = useContext(SupplierTableContext);
  const t = useTranslations("ManageSupplies");
  const columns = getColumns(t as (key: string) => string);

  const listGuestsQuery = useGetListSupplyBySupplierQuery({
    supplierId: supplierIdEdit as number,
    enabled: Boolean(supplierIdEdit),
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
    if (supplierIdEdit) {
      table.setPagination({
        pageIndex: 0,
        pageSize: PAGE_SIZE,
      });
    }
  }, [supplierIdEdit, table]);

  const supplierName = data[0]?.supplier?.name || "Nhà cung cấp";

  const reset = () => {
    setSupplierIdEdit(undefined);
  };

  return (
    <Dialog
      open={Boolean(supplierIdEdit)}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-225 flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("supplierIngredientsTitle", { name: supplierName })}</DialogTitle>
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
              <AddSupply />
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
