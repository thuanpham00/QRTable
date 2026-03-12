/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createContext, useContext, useState } from "react";
import AutoPagination from "@/components/auto-pagination";
import { Search, X } from "lucide-react";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import { useRouter } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import {
  InventoryStockListResType,
  InventoryStockQueryType,
  SearchInventoryStock,
  SearchInventoryStockType,
} from "@/schemaValidations/inventory-stock.schema";
import {
  useGetListInventoryStockNoPaginationQuery,
  useGetListInventoryStockQuery,
} from "@/queries/useInventoryStock";
import Image from "next/image";
import WarningStocksDialog from "@/app/[locale]/manage/inventory-stocks/warning-stocks-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EditInventoryStock from "@/app/[locale]/manage/inventory-stocks/edit-inventory-stock";
import InventoryBatchesDialog from "@/app/[locale]/manage/inventory-stocks/inventory-batches-dialog";
import { toast } from "sonner";
import { useAppStore } from "@/components/app-provider";
import { Role } from "@/constants/type";

type InventoryStockItem = InventoryStockListResType["data"][0];

// sử dụng trong phạm vị component AccountTable và các component con của nó
export const InventoryStockTableContext = createContext<{
  inventoryStockIdEdit: number | undefined;
  setInventoryStockIdEdit: (value: number | undefined) => void;
  showModal: number | null;
  setShowModal: (value: number | null) => void;
}>({
  inventoryStockIdEdit: undefined,
  setInventoryStockIdEdit: (value: number | undefined) => {},
  showModal: null,
  setShowModal: (value: number | null) => {},
});

export const getColumns = (t: any): ColumnDef<InventoryStockItem>[] => [
  {
    accessorKey: "id",
    header: t("id"),
    size: 60,
  },
  {
    accessorKey: "ingredientName",
    header: t("ingredientName"),
    size: 200,
    cell: ({ row }) => (
      <div className="font-medium flex items-center gap-2">
        <div>
          <Image
            src={row.original.ingredientImage as string}
            alt={row.original.ingredientName as string}
            width={80}
            height={80}
            className="h-16 w-16 rounded-md"
          />
        </div>
        <div>
          {row.getValue("ingredientName") || t("noData")}
          {row.original.ingredientCategory && (
            <div className="text-xs text-muted-foreground">({row.original.ingredientCategory})</div>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-right">{t("quantity")}</div>,
    size: 100,
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      const minStock = row.original.minStock;
      const maxStock = row.original.maxStock;

      let colorClass = "";
      if (minStock && quantity < minStock) {
        colorClass = "text-red-600 font-semibold";
      } else if (maxStock && quantity > maxStock) {
        colorClass = "text-orange-600";
      }

      return <div className={`text-right ${colorClass}`}>{quantity}</div>;
    },
  },
  {
    accessorKey: "unitIngredient",
    header: () => <div className="text-right">{t("unitIngredient")}</div>,
    size: 120,
    cell: ({ row }) => <div className="text-right">{row.original.ingredientUnit}</div>,
  },
  {
    id: "stockStatus",
    header: () => <div className="text-right">{t("stockStatus")}</div>,
    size: 120,
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const minStock = row.original.minStock;
      const maxStock = row.original.maxStock;

      if (minStock && quantity < minStock) {
        return (
          <div className="text-right">
            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">{t("lowStock")}</span>
          </div>
        );
      } else if (maxStock && quantity > maxStock) {
        return (
          <div className="text-right">
            <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
              {t("overstock")}
            </span>
          </div>
        );
      }
      return (
        <div className="text-right">
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">{t("normal")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "minStock",
    header: () => <div className="text-right">{t("stockRange")}</div>,
    size: 120,
    cell: ({ row }) => {
      const minStock = row.original.minStock;
      const maxStock = row.original.maxStock;
      return (
        <div className="text-sm text-right">
          {minStock ?? "—"} / {maxStock ?? "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "avgUnitPrice",
    header: () => <div className="text-right">{t("avgUnitPrice")}</div>,
    size: 120,
    cell: ({ row }) => (
      <div className="text-right">
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
          row.getValue("avgUnitPrice"),
        )}
      </div>
    ),
  },
  {
    accessorKey: "totalValue",
    header: () => <div className="text-right">{t("totalValue")}</div>,
    size: 140,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
          row.getValue("totalValue"),
        )}
      </div>
    ),
  },
  {
    accessorKey: "batchCount",
    header: () => <div className="text-right">{t("batchCount")}</div>,
    size: 80,
    cell: ({ row }) => <div className="text-right">{row.getValue("batchCount") || 0}</div>,
  },
  {
    accessorKey: "lastImport",
    header: () => <div className="text-right">{t("lastImport")}</div>,
    size: 140,
    cell: ({ row }) => {
      const lastImport = row.getValue("lastImport") as Date | null;
      return (
        <div className="text-sm text-right">
          {lastImport
            ? new Date(lastImport).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : t("noData")}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: () => <div className="text-right">{t("actions")}</div>,
    size: 150,
    cell: function Actions({ row }) {
      const { setInventoryStockIdEdit, setShowModal } = useContext(InventoryStockTableContext);
      const openEditInventoryStock = () => {
        setInventoryStockIdEdit(row.original.id);
        setShowModal(1);
      };

      return (
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            onClick={openEditInventoryStock}
            className="bg-blue-500 hover:bg-blue-400 text-white"
          >
            {t("edit")}
          </Button>
        </div>
      );
    },
  },

  {
    id: "batches",
    header: () => <div className="text-right">{t("batches")}</div>,
    size: 150,
    cell: function Actions({ row }) {
      const { setInventoryStockIdEdit, setShowModal } = useContext(InventoryStockTableContext);
      const openEditInventoryStock = () => {
        if ((row.original.batchCount as number) <= 0) {
          toast.error(t("noBatches"));
          return;
        }
        setInventoryStockIdEdit(row.original.id);
        setShowModal(2);
      };

      return (
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            onClick={openEditInventoryStock}
            className="bg-red-500 hover:bg-red-400 text-white"
          >
            {t("seeBatches")} {row.original.batchCount ? `(${row.original.batchCount})` : "(0)"}
          </Button>
        </div>
      );
    },
  },
];

export default function InventoryStockTable() {
  const t = useTranslations("ManageInventoryStocks");
  const columns = getColumns(t);
  const router = useRouter();
  const queryParams = useQueryParams();

  const isRole = useAppStore((state) => state.isRole);
  const socket = useAppStore((state) => state.socket);

  const limit = queryParams.limit ? Number(queryParams.limit) : 10;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: InventoryStockQueryType = omitBy(
    {
      page,
      limit,
      ingredientName: queryParams.ingredientName || undefined,
      lowStock: queryParams.lowStock === "true" ? true : queryParams.lowStock === "false" ? false : undefined,
    },
    isUndefined,
  ) as InventoryStockQueryType;

  const form = useForm<SearchInventoryStockType>({
    resolver: zodResolver(SearchInventoryStock),
    defaultValues: {
      ingredientName: queryParams.ingredientName || "",
      lowStock: queryParams.lowStock === "true" ? true : queryParams.lowStock === "false" ? false : undefined,
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, ingredientName: undefined, lowStock: undefined })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset({
      ingredientName: "",
      lowStock: undefined,
    });
    router.push(`/manage/inventory-stocks?${params.toString()}`);
  };

  const submit = (data: SearchInventoryStockType) => {
    const params = new URLSearchParams(
      Object.entries({
        ...queryConfig,
        page: 1,
        ingredientName: data.ingredientName,
        lowStock: data.lowStock,
      })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/inventory-stocks?${params.toString()}`);
  };

  const [inventoryStockIdEdit, setInventoryStockIdEdit] = useState<number | undefined>();

  const listInventoryStock = useGetListInventoryStockQuery(queryConfig);
  const listInventoryStockNoPagination = useGetListInventoryStockNoPaginationQuery({
    key: "inventory-stocks-no-pagination",
    enabled: isRole !== Role.Guest && Boolean(isRole) && Boolean(socket), // có nghĩa là chỉ chạy khi đã login
  });

  const data: InventoryStockListResType["data"] = listInventoryStock.data?.payload.data || [];
  const currentPage = listInventoryStock.data?.payload.pagination.page || 0; // trang hiện tại
  const totalPages = listInventoryStock.data?.payload.pagination.totalPages || 0; // tổng số trang
  const total = listInventoryStock.data?.payload.pagination.total || 0; // tổng số item

  const pagination = {
    pageIndex: queryConfig.page ? queryConfig.page - 1 : 0,
    pageSize: queryConfig.limit,
  };

  const table = useReactTable({
    data,
    columns,
    manualPagination: true, // phân trang thủ công
    manualFiltering: true, // filter thủ công
    manualSorting: true, // sort thủ công
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
  });

  const [showModal, setShowModal] = useState<number | null>(null);

  return (
    <InventoryStockTableContext.Provider
      value={{ inventoryStockIdEdit, setInventoryStockIdEdit, showModal, setShowModal }}
    >
      <div className="w-full">
        <EditInventoryStock showModal={showModal} setShowModal={setShowModal} />
        <WarningStocksDialog data={listInventoryStockNoPagination.data?.payload.data || []} />
        <InventoryBatchesDialog showModal={showModal} setShowModal={setShowModal} />

        <div className="flex items-center pb-4 pt-2">
          <Form {...form}>
            <form
              noValidate
              className="flex items-center gap-2 py-4"
              onReset={reset}
              onSubmit={form.handleSubmit(submit, (err) => {
                console.log(err);
              })}
            >
              <FormField
                control={form.control}
                name="ingredientName"
                render={({ field }) => (
                  <FormItem>
                    <Input placeholder={t("filterIngredientName")} className="max-w-sm" {...field} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lowStock"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="airplane-mode">{t("lowStock")}</Label>
                      <Switch
                        id="airplane-mode"
                        checked={field.value === true}
                        onCheckedChange={(val) => {
                          field.onChange(val);
                          console.log(val);
                        }}
                      />
                    </div>
                  </FormItem>
                )}
              />

              <Button variant="outline" size="icon" type="reset">
                <X />
              </Button>

              <Button variant="outline" size="icon" className="bg-blue-500!" type="submit">
                <Search />
              </Button>
            </form>
          </Form>
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
            {t("showingOf", { count: data.length, total })}
          </div>
          <div>
            <AutoPagination
              queryConfig={queryConfig}
              page={currentPage} // trang hiện tại
              totalPages={totalPages} // tổng số trang
              pathname="/manage/inventory-stocks"
            />
          </div>
        </div>
      </div>
    </InventoryStockTableContext.Provider>
  );
}
