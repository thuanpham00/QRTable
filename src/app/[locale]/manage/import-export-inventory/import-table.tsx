/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createContext, useContext, useState } from "react";
import AutoPagination from "@/components/auto-pagination";
import { Eye, PlusCircle, RefreshCcw, Search, X } from "lucide-react";
import useQueryParams from "@/hooks/useQueryParams";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  GetImportReceiptListResType,
  ImportReceiptQueryType,
  SearchImportReceipt,
  SearchImportReceiptType,
} from "@/schemaValidations/import-receipt.schema";
import { useGetListImportReceiptQuery } from "@/queries/useImportReceipt";
import { format } from "date-fns";
import ListExportReceiptItemDialog from "@/app/[locale]/manage/import-export-inventory/list-export-receipt-item-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isUndefined, omitBy } from "lodash";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSupplierOptionQuery } from "@/queries/useSupplier";

type ImportReceiptItem = GetImportReceiptListResType["data"][0];

export const getColumns = (t: any): ColumnDef<ImportReceiptItem>[] => [
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
    accessorKey: "importDate",
    header: t("importDate"),
    cell: ({ row }) => <div>{format(new Date(row.getValue("importDate")), "dd/MM/yyyy HH:mm")}</div>,
  },
  {
    accessorKey: "supplierName",
    header: t("supplier"),
    cell: ({ row }) => <div>{row.getValue("supplierName") || "-"}</div>,
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
      const router = useRouter();
      const openViewItems = () => {
        router.push("/manage/update-import-receipt/" + row.original.id);
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

export default function ImportTable() {
  const t = useTranslations("ManageImportReceipts");
  const columns = getColumns(t);
  const router = useRouter();
  const queryParams = useQueryParams();

  const limit = queryParams.limit ? Number(queryParams.limit) : 10;
  const page = queryParams.page ? Number(queryParams.page) : 1;
  const type = queryParams.type || "export";

  const queryConfig: ImportReceiptQueryType = omitBy(
    {
      type,
      page,
      limit,
      fromDate: queryParams.fromDate ? new Date(queryParams.fromDate as string).toISOString() : undefined,
      toDate: queryParams.toDate ? new Date(queryParams.toDate as string).toISOString() : undefined,
      status: queryParams.status || undefined,
      supplierId: queryParams.supplierId || undefined,
    },
    isUndefined,
  ) as ImportReceiptQueryType;

  const {data: listImportReceipt, refetch} = useGetListImportReceiptQuery(queryConfig);

  const data: GetImportReceiptListResType["data"] = listImportReceipt?.payload.data || [];
  const currentPage = listImportReceipt?.payload.pagination.page || 0; // trang hiện tại
  const totalPages = listImportReceipt?.payload.pagination.totalPages || 0; // tổng số trang
  const total = listImportReceipt?.payload.pagination.total || 0; // tổng số item

  const pagination = {
    pageIndex: queryConfig.page ? queryConfig.page - 1 : 0,
    pageSize: queryConfig.limit,
  };

  const listSupplierOptionQuery = useGetSupplierOptionQuery();
  const dataOptionsSupplier = listSupplierOptionQuery.data?.payload.data || [];

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

  const form = useForm<SearchImportReceiptType>({
    resolver: zodResolver(SearchImportReceipt),
    defaultValues: {
      fromDate: queryParams.fromDate ? new Date(queryParams.fromDate as string).toISOString() : undefined,
      toDate: queryParams.toDate ? new Date(queryParams.toDate as string).toISOString() : undefined,
      status: queryParams.status || undefined,
      supplierId: queryParams.supplierId || undefined,
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({
        ...queryConfig,
        fromDate: undefined,
        toDate: undefined,
        status: undefined,
        supplierId: undefined,
      })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset({
      fromDate: undefined,
      toDate: undefined,
      status: "",
      supplierId: "",
    });
    router.push(`/manage/import-export-inventory?${params.toString()}`);
  };

  const submit = (data: SearchImportReceiptType) => {
    const params = new URLSearchParams(
      Object.entries({
        ...queryConfig,
        page: 1,
        fromDate: data.fromDate,
        toDate: data.toDate,
        status: data.status,
        supplierId: data.supplierId,
      })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/import-export-inventory?${params.toString()}`);
  };

  return (
    <div>
      <div className="w-full">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle className="text-xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center pb-4">
              <Form {...form}>
                <form
                  noValidate
                  className="flex items-center gap-2 pt-4 pb-2"
                  onReset={reset}
                  onSubmit={form.handleSubmit(submit, (err) => {
                    console.log(err);
                  })}
                >
                  <div>
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
                                  field.onChange(
                                    event.target.value ? new Date(event.target.value) : undefined,
                                  )
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
                                  field.onChange(
                                    event.target.value ? new Date(event.target.value) : undefined,
                                  )
                                }
                              />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              value={field.value || ""}
                            >
                              <SelectTrigger className="w-45">
                                <SelectValue placeholder={t("chooseStatus")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>{t("status")}</SelectLabel>

                                  <SelectItem key={"draft"} value="Draft">
                                    {t("draft")}
                                  </SelectItem>
                                  <SelectItem key={"completed"} value="Completed">
                                    {t("completed")}
                                  </SelectItem>
                                  <SelectItem key={"cancelled"} value="Cancelled">
                                    {t("cancelled")}
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(String(val) || "");
                              }}
                              value={field.value || ""}
                            >
                              <SelectTrigger className="w-60">
                                <SelectValue placeholder={t("chooseSupplier")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>{t("supplier")}</SelectLabel>
                                  {dataOptionsSupplier.map((supplier) => (
                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                      {supplier.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" type="reset">
                          <X />
                        </Button>
                        <Button variant="outline" size="icon" className="bg-blue-500!" type="submit">
                          <Search color="white" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>

              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" className="bg-red-500! hover:bg-red-600!" onClick={() => refetch()}>
                  <RefreshCcw />
                </Button>
              </div>
            </div>
            <Link
              href={"/manage/add-import-receipt"}
              className="bg-green-600 items-center gap-2 p-2 mb-4 inline-flex w-46 rounded text-white"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{t("createImportReceipt")}</span>
            </Link>

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
    </div>
  );
}
