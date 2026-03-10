/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createContext, useContext, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { handleErrorApi } from "@/lib/utils";
import { useRouter } from "@/i18n/routing";
import AutoPagination from "@/components/auto-pagination";
import { toast } from "sonner";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import { Badge } from "@/components/ui/badge";
import AddSupplier from "@/app/[locale]/manage/suppliers/add-supplier";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EyeIcon, Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import {
  SearchSupplier,
  SearchSupplierType,
  SupplierListResType,
  SupplierQueryType,
} from "@/schemaValidations/supplier.schema";
import { useDeleteSupplierMutation, useGetListSupplierQuery } from "@/queries/useSupplier";
import EditSupplier from "@/app/[locale]/manage/suppliers/edit-supplier";
import DialogShowSupplyBySupplier from "@/app/[locale]/manage/suppliers/show-supply.dialog";

type SupplierItem = SupplierListResType["data"][0];

// sử dụng trong phạm vị component SupplierTable và các component con của nó
export const SupplierTableContext = createContext<{
  supplierIdEdit: number | undefined;
  setSupplierIdEdit: (value: number | undefined) => void;
  supplierDelete: SupplierItem | null;
  setSupplierDelete: (value: SupplierItem | null) => void;
  showModal: number | null;
  setShowModal: (value: number | null) => void;
}>({
  setSupplierIdEdit: (value: number | undefined) => {},
  supplierIdEdit: undefined,
  supplierDelete: null,
  setSupplierDelete: (value: SupplierItem | null) => {},
  showModal: null,
  setShowModal: (value: number | null) => {},
});

export const getColumns = (t: any) => {
  const columns: ColumnDef<SupplierItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 60,
    },
    {
      accessorKey: "code",
      header: t("code"),
      size: 100,
      cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
    },
    {
      accessorKey: "name",
      header: t("name"),
      size: 150,
      cell: ({ row }) => <div className="capitalize font-semibold">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) =>
        row.getValue("status") === "Active" ? (
          <Badge className="bg-green-500 text-white">{t("active")}</Badge>
        ) : (
          <Badge variant="destructive">{t("inactive")}</Badge>
        ),
    },
    {
      accessorKey: "ingredientCount",
      header: t("ingredients"),
      cell: function Actions({ row }) {
        const { setSupplierIdEdit, setShowModal } = useContext(SupplierTableContext);
        const openEditSupplier = () => {
          setShowModal(2);
          setSupplierIdEdit(row.original.id);
        };

        return (
          <div className="flex items-center justify-center gap-2">
            <div className="whitespace-nowrap">{row.getValue("ingredientCount")}</div>
            <Button variant={"outline"} onClick={openEditSupplier} type="button">
              <EyeIcon />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: t("phone"),
      size: 130,
      cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("phone") || "—"}</div>,
    },
    {
      accessorKey: "email",
      header: t("email"),
      size: 220,
      cell: ({ row }) => <div className="text-sm">{row.getValue("email") || "—"}</div>,
    },
    {
      accessorKey: "address",
      header: t("address"),
      size: 200,
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">{row.getValue("address") || "—"}</div>
      ),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: function Actions({ row }) {
        const { setSupplierIdEdit, setSupplierDelete, setShowModal } = useContext(SupplierTableContext);
        const openEditSupplier = () => {
          setSupplierIdEdit(row.original.id);
          setShowModal(1);
        };

        const openDeleteSupplier = () => {
          setSupplierDelete(row.original);
        };
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              type="button"
              onClick={openEditSupplier}
              className="bg-blue-500 hover:bg-blue-400 text-white"
            >
              {t("edit")}
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={openDeleteSupplier}
              className="bg-red-500 hover:bg-red-400 text-white"
            >
              {t("delete")}
            </Button>
          </div>
        );
      },
    },
  ];
  return columns;
};

function AlertDialogDeleteSupplier({
  supplierDelete,
  setSupplierDelete,
}: {
  supplierDelete: SupplierItem | null;
  setSupplierDelete: (value: SupplierItem | null) => void;
}) {
  const t = useTranslations("ManageSuppliers");
  const deleteSupplierMutation = useDeleteSupplierMutation();

  const handleDelete = async () => {
    if (supplierDelete) {
      try {
        const {
          payload: { message },
        } = await deleteSupplierMutation.mutateAsync(supplierDelete.id);
        toast.success(message, {
          duration: 2000,
        });
        setSupplierDelete(null);
      } catch (error) {
        handleErrorApi({ errors: error });
      }
    }
  };

  return (
    <AlertDialog
      open={Boolean(supplierDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setSupplierDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteSupplier")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteSupplierDesc")}{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">{supplierDelete?.name}</span>{" "}
            {t("deleteSupplierDesc2")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSupplierDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function SupplierTable() {
  const t = useTranslations("ManageSuppliers");
  const router = useRouter();
  const queryParams = useQueryParams();
  const columns = getColumns(t);
  const limit = queryParams.limit ? Number(queryParams.limit) : 5;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: SupplierQueryType = omitBy(
    {
      page,
      limit,
      name: queryParams.name || undefined,
      status: queryParams.status || undefined,
    },
    isUndefined,
  ) as SupplierQueryType;

  const form = useForm<SearchSupplierType>({
    resolver: zodResolver(SearchSupplier),
    defaultValues: {
      name: queryParams.name || "",
      status: queryParams.status || "",
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, status: undefined, name: undefined })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset();
    router.push(`/manage/suppliers?${params.toString()}`);
  };

  const submit = (data: SearchSupplierType) => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, page: 1, name: data.name, status: data.status })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/suppliers?${params.toString()}`);
  };

  const [supplierIdEdit, setSupplierIdEdit] = useState<number | undefined>();
  const [supplierDelete, setSupplierDelete] = useState<SupplierItem | null>(null);

  const listSupplier = useGetListSupplierQuery(queryConfig);

  const data: SupplierListResType["data"] = listSupplier.data?.payload.data || [];
  const currentPage =
    (listSupplier.data?.payload.pagination && listSupplier.data?.payload.pagination.page) || 0; // trang hiện tại
  const totalPages =
    (listSupplier.data?.payload.pagination && listSupplier.data?.payload.pagination.totalPages) || 0; // tổng số trang
  const total = (listSupplier.data?.payload.pagination && listSupplier.data?.payload.pagination.total) || 0; // tổng số item

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
    <SupplierTableContext.Provider
      value={{
        supplierIdEdit,
        setSupplierIdEdit,
        supplierDelete,
        setSupplierDelete,
        showModal,
        setShowModal,
      }}
    >
      <div className="w-full">
        <div className="flex items-center gap-2">
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Input placeholder={t("filterName")} className="max-w-sm" {...field} />
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
                      value={field.value}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder={t("filterStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">{t("active")}</SelectItem>
                        <SelectItem value="Inactive">{t("inactive")}</SelectItem>
                      </SelectContent>
                    </Select>
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

          <div className="ml-auto flex items-center gap-2">
            <AddSupplier />
          </div>
        </div>
        <div className="rounded-md border max-w-[calc(100vw-300px)] overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : "auto" }}
                      >
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
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : "auto",
                        }}
                      >
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
            Hiển thị <strong>{data.length}</strong> trong <strong>{total}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              queryConfig={queryConfig}
              page={currentPage} // trang hiện tại
              totalPages={totalPages} // tổng số trang
              pathname="/manage/suppliers"
            />
          </div>
        </div>
      </div>

      <EditSupplier showModal={showModal} setShowModal={setShowModal} />
      <AlertDialogDeleteSupplier supplierDelete={supplierDelete} setSupplierDelete={setSupplierDelete} />
      <DialogShowSupplyBySupplier showModal={showModal} setShowModal={setShowModal} />
    </SupplierTableContext.Provider>
  );
}
