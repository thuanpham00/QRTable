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
import { Eye, RefreshCcw, Search, X } from "lucide-react";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import { useRouter } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import {
  ExportReceiptListResType,
  ExportReceiptQueryType,
  SearchExportReceipt,
  SearchExportReceiptType,
} from "@/schemaValidations/export-receipt.schema";
import { useGetListExportReceiptQuery } from "@/queries/useExportReceipt";
import { format } from "date-fns";
import ListExportReceiptItemDialog from "@/app/[locale]/manage/import-export-inventory/list-export-receipt-item-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ExportReceiptItem = ExportReceiptListResType["data"][0];

// sử dụng trong phạm vị component ExportTable và các component con của nó
export const ExportReceiptTableContext = createContext<{
  exportReceiptIdViewItems: number | undefined;
  setExportReceiptIdViewItems: (value: number | undefined) => void;
}>({
  exportReceiptIdViewItems: undefined,
  setExportReceiptIdViewItems: (value: number | undefined) => {},
});

export const getColumns = (t: any): ColumnDef<ExportReceiptItem>[] => [
  {
    accessorKey: "id",
    header: t("id"),
  },
  {
    accessorKey: "code",
    header: t("code"),
    cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "exportDate",
    header: t("exportDate"),
    cell: ({ row }) => <div>{format(new Date(row.getValue("exportDate")), "dd/MM/yyyy HH:mm")}</div>,
  },
  {
    accessorKey: "exportType",
    header: t("exportType"),
    cell: ({ row }) => {
      const type = row.getValue("exportType") as string;
      const colorMap: Record<string, string> = {
        Production: "bg-blue-100 text-blue-800",
        Waste: "bg-red-100 text-red-800",
        Other: "bg-gray-100 text-gray-800",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${colorMap[type] || "bg-gray-100 text-gray-800"}`}
        >
          {t(type.toLowerCase())}
        </span>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: t("totalAmount"),
    cell: ({ row }) => (
      <div className="font-medium">
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
          row.getValue("totalAmount"),
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: t("status"),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colorMap: Record<string, string> = {
        Draft: "bg-yellow-100 text-yellow-800",
        Completed: "bg-green-100 text-green-800",
        Cancelled: "bg-red-100 text-red-800",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${colorMap[status] || "bg-gray-100 text-gray-800"}`}
        >
          {t(status.toLowerCase())}
        </span>
      );
    },
  },
  {
    accessorKey: "createdByName",
    header: t("createdBy"),
    cell: ({ row }) => <div>{row.getValue("createdByName") || "-"}</div>,
  },
  {
    id: "viewItems",
    header: t("items"),
    cell: function ViewItems({ row }) {
      const { setExportReceiptIdViewItems } = useContext(ExportReceiptTableContext);
      const openViewItems = () => {
        setExportReceiptIdViewItems(row.original.id);
      };

      return (
        <Button
          size="sm"
          variant="default"
          onClick={openViewItems}
          className="text-green-600 hover:text-green-700 bg-green-50"
        >
          <Eye className="w-4 h-4 mr-1" />
          {t("viewItems")}
        </Button>
      );
    },
  },
];

export default function ExportTable() {
  const t = useTranslations("ManageExportReceipts");
  const columns = getColumns(t);
  const router = useRouter();
  const queryParams = useQueryParams();

  const limit = queryParams.limit ? Number(queryParams.limit) : 10;
  const page = queryParams.page ? Number(queryParams.page) : 1;
  const type = queryParams.type || "export";

  const queryConfig: ExportReceiptQueryType = omitBy(
    {
      type,
      page,
      limit,
      fromDate: queryParams.fromDate ? new Date(queryParams.fromDate as string).toISOString() : undefined,
      toDate: queryParams.toDate ? new Date(queryParams.toDate as string).toISOString() : undefined,
    },
    isUndefined,
  ) as ExportReceiptQueryType;

  const form = useForm<SearchExportReceiptType>({
    resolver: zodResolver(SearchExportReceipt),
    defaultValues: {
      fromDate: queryParams.fromDate ? new Date(queryParams.fromDate as string).toISOString() : undefined,
      toDate: queryParams.toDate ? new Date(queryParams.toDate as string).toISOString() : undefined,
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, fromDate: undefined, toDate: undefined })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset();
    router.push(`/manage/import-export-inventory?${params.toString()}`);
  };

  const submit = (data: SearchExportReceiptType) => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, page: 1, fromDate: data.fromDate, toDate: data.toDate })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/import-export-inventory?${params.toString()}`);
  };

  const [exportReceiptIdViewItems, setExportReceiptIdViewItems] = useState<number | undefined>();

  const { data: listExportReceipt, refetch } = useGetListExportReceiptQuery(queryConfig);

  const data: ExportReceiptListResType["data"] = listExportReceipt?.payload.data || [];
  const currentPage = listExportReceipt?.payload.pagination.page || 0; // trang hiện tại
  const totalPages = listExportReceipt?.payload.pagination.totalPages || 0; // tổng số trang
  const total = listExportReceipt?.payload.pagination.total || 0; // tổng số item

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

  return (
    <ExportReceiptTableContext.Provider
      value={{
        exportReceiptIdViewItems,
        setExportReceiptIdViewItems,
      }}
    >
      <div className="w-full">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle className="text-xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pb-4">
              <Form {...form}>
                <form
                  noValidate
                  className="flex items-center gap-2 py-4"
                  onReset={reset}
                  onSubmit={form.handleSubmit(submit, (err) => {
                    console.log(err);
                  })}
                >
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="fromDate"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <span className="mr-2 text-sm">{t("from")}</span>
                            <Input
                              type="datetime-local"
                              placeholder={t("fromDate")}
                              className="text-sm"
                              value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                              onChange={(event) =>
                                field.onChange(event.target.value ? new Date(event.target.value) : undefined)
                              }
                            />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="toDate"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <span className="mr-2 text-sm">{t("to")}</span>
                            <Input
                              type="datetime-local"
                              placeholder={t("toDate")}
                              className="text-sm"
                              value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                              onChange={(event) =>
                                field.onChange(event.target.value ? new Date(event.target.value) : undefined)
                              }
                            />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button variant="outline" size="icon" type="reset">
                    <X />
                  </Button>

                  <Button variant="outline" size="icon" className="bg-blue-500!" type="submit">
                    <Search color="white" />
                  </Button>
                </form>
              </Form>
              <Button variant="outline" className="bg-red-500! hover:bg-red-600!" onClick={() => refetch()}>
                <RefreshCcw />
              </Button>
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
                  pathname="/manage/import-export-inventory"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ListExportReceiptItemDialog />
    </ExportReceiptTableContext.Provider>
  );
}
