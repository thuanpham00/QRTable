/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AccountListResType,
  AccountQueryType,
  AccountType,
  SearchAccount,
  SearchAccountType,
} from "@/schemaValidations/account.schema";
import AddEmployee from "@/app/[locale]/manage/accounts/add-employee";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditEmployee from "@/app/[locale]/manage/accounts/edit-employee";
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
import AutoPagination from "@/components/auto-pagination";
import { useDeleteEmployeeMutation, useGetListEmployeeQuery } from "@/queries/useAccount";
import { toast } from "sonner";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import { useRouter } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { RefreshCcw, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

type AccountItem = AccountListResType["data"][0];

// sử dụng trong phạm vị component AccountTable và các component con của nó
const AccountTableContext = createContext<{
  employeeIdEdit: number | undefined;
  setEmployeeIdEdit: (value: number) => void;
  employeeDelete: AccountItem | null;
  setEmployeeDelete: (value: AccountItem | null) => void;
}>({
  employeeIdEdit: undefined,
  setEmployeeIdEdit: (value: number | undefined) => {},
  employeeDelete: null,
  setEmployeeDelete: (value: AccountItem | null) => {},
});

export const getColumns = (t: any) => {
  const columns: ColumnDef<AccountType>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "avatar",
      header: "Avatar",
      cell: ({ row }) => (
        <div>
          <Avatar className="aspect-square w-25 h-25 rounded-md object-cover">
            <AvatarImage src={row.getValue("avatar")} />
            <AvatarFallback className="rounded-none">{row.original.name}</AvatarFallback>
          </Avatar>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "role",
      header: t("role"),
      cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
    },
    {
      accessorKey: "email",
      header: t("email"),
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      id: "actions",
      header: t("actions"),
      cell: function Actions({ row }) {
        const { setEmployeeIdEdit, setEmployeeDelete } = useContext(AccountTableContext);
        const openEditEmployee = () => {
          setEmployeeIdEdit(row.original.id);
        };

        const openDeleteEmployee = () => {
          setEmployeeDelete(row.original);
        };
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={openEditEmployee} className="bg-blue-500 hover:bg-blue-400 text-white">
              {t("edit")}
            </Button>
            <Button
              size="sm"
              onClick={openDeleteEmployee}
              disabled={row.original.role === "Owner"}
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

function AlertDialogDeleteAccount({
  employeeDelete,
  setEmployeeDelete,
}: {
  employeeDelete: AccountItem | null;
  setEmployeeDelete: (value: AccountItem | null) => void;
}) {
  const t = useTranslations("ManageAccounts");
  const deleteEmployeeMutation = useDeleteEmployeeMutation();

  const handleDelete = async () => {
    if (employeeDelete) {
      const {
        payload: { message },
      } = await deleteEmployeeMutation.mutateAsync(employeeDelete.id);
      toast.success(message, {
        duration: 2000,
      });
      setEmployeeDelete(null);
    }
  };

  return (
    <AlertDialog
      open={Boolean(employeeDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setEmployeeDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteAccount")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteAccountDesc")}{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">{employeeDelete?.name}</span>{" "}
            {t("deleteAccountDesc2")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setEmployeeDelete(null);
            }}
          >
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{t("continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AccountTable() {
  const t = useTranslations("ManageAccounts");
  const router = useRouter();
  const queryParams = useQueryParams();
  const columns = getColumns(t);

  const limit = queryParams.limit ? Number(queryParams.limit) : 5;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: AccountQueryType = omitBy(
    {
      page,
      limit,
      email: queryParams.email ? queryParams.email : undefined,
    },
    isUndefined,
  ) as AccountQueryType;

  const form = useForm<SearchAccountType>({
    resolver: zodResolver(SearchAccount),
    defaultValues: {
      email: queryParams.email || "",
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, email: undefined })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset();
    router.push(`/manage/accounts?${params.toString()}`);
  };

  const submit = (data: SearchAccountType) => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, page: 1, email: data.email })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/accounts?${params.toString()}`);
  };

  const [employeeIdEdit, setEmployeeIdEdit] = useState<number | undefined>();
  const [employeeDelete, setEmployeeDelete] = useState<AccountItem | null>(null);

  const { data, refetch } = useGetListEmployeeQuery(queryConfig);

  const dataAccount: AccountListResType["data"] = data?.payload.data || [];
  const currentPage = data?.payload.pagination.page || 0; // trang hiện tại
  const totalPages = data?.payload.pagination.totalPages || 0; // tổng số trang
  const total = data?.payload.pagination.total || 0; // tổng số item

  const pagination = {
    pageIndex: queryConfig.page ? queryConfig.page - 1 : 0,
    pageSize: queryConfig.limit,
  }; // chỉ chứa thông tin về trang hiện tại mà TanStack Table đang hiển thị.

  const table = useReactTable({
    data: dataAccount,
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
    <AccountTableContext.Provider
      value={{ employeeIdEdit, setEmployeeIdEdit, employeeDelete, setEmployeeDelete }}
    >
      <div className="w-full">
        <EditEmployee id={employeeIdEdit} setId={setEmployeeIdEdit} />
        <AlertDialogDeleteAccount employeeDelete={employeeDelete} setEmployeeDelete={setEmployeeDelete} />
        <div className="flex items-center justify-between py-4">
          <Form {...form}>
            <form
              noValidate
              className="flex items-center gap-2"
              onReset={reset}
              onSubmit={form.handleSubmit(submit, (err) => {
                console.log(err);
              })}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Input placeholder={t("filterEmail")} className="max-w-sm" {...field} />
                  </FormItem>
                )}
              />

              <Button variant="outline" size="icon" type="reset">
                <X />
              </Button>

              <Button variant="outline" size="icon" className="bg-blue-500!" type="submit">
                <Search color="white" />
              </Button>
            </form>
          </Form>
          <div className="ml-auto flex items-center gap-2">
            <AddEmployee />
            <Button variant="outline" className="bg-red-500! hover:bg-red-600!" onClick={() => refetch()}>
              <RefreshCcw />
            </Button>
          </div>
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
            Hiển thị <strong>{dataAccount.length}</strong> trong <strong>{total}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              queryConfig={queryConfig}
              page={currentPage} // trang hiện tại
              totalPages={totalPages} // tổng số trang
              pathname="/manage/accounts"
            />
          </div>
        </div>
      </div>
    </AccountTableContext.Provider>
  );
}
