/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/incompatible-library */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createContext, useContext, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import AutoPagination from "@/components/auto-pagination";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import { Badge } from "@/components/ui/badge";
import AddMenu from "@/app/[locale]/manage/menus/add-menu";
import { useGetListMenuQuery, useUpdateMenuMutation } from "@/queries/useMenu";
import {
  MenuListResType,
  MenuQueryType,
  SearchMenu,
  SearchMenuType,
  UpdateMenuBodyType,
} from "@/schemaValidations/menu.schema";
import { CircleAlert, RefreshCcw, Search, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";
import { useAppStore } from "@/components/app-provider";
import revalidateApiRequests from "@/apiRequests/revalidate";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export type MenuItem = MenuListResType["data"][0];

const getColumns = (t: any) => {
  const columns: ColumnDef<MenuItem>[] = [
    {
      accessorKey: "id",
      header: t("id"),
    },
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => <div className="font-semibold">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: t("description2"),
      cell: ({ row }) => <div className="max-w-md line-clamp-2">{row.getValue("description")}</div>,
    },
    {
      accessorKey: "version",
      header: t("version"),
      cell: ({ row }) => <div className="text-center">v{row.getValue("version")}</div>,
    },
    {
      accessorKey: "isActive",
      header: t("status"),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge
            className={
              isActive
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-500 text-white hover:bg-gray-600"
            }
          >
            {isActive ? t("active") : t("inactive")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "on/off",
      header: t("onOff"),
      cell: function Actions({ row }) {
        const { updateStatusMenu } = useContext(MenuTableContext);
        const isActive = row.getValue("isActive") as boolean;

        const handleUpdateStatus = async () => {
          updateStatusMenu(row.original.id, {
            name: row.original.name,
            description: row.original.description || "",
            version: row.original.version,
            isActive: !isActive,
          });
        };
        return <Switch checked={isActive} onCheckedChange={handleUpdateStatus} />;
      },
    },
    {
      accessorKey: "countMenuItems",
      header: t("countMenuItems"),
      cell: ({ row }) => {
        const countMenuItems = row.getValue("countMenuItems") as number | undefined;
        return <div className="text-center">{countMenuItems ?? 0}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: t("createdAt"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div>{date.toLocaleDateString("vi-VN")}</div>;
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: function Actions({ row }) {
        return (
          <div>
            <Link
              href={`/manage/menus/${row.original.id}`}
              className="bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-400 text-white"
            >
              {t("detail")}
            </Link>
          </div>
        );
      },
    },
  ];
  return columns;
};

const MenuTableContext = createContext<{
  updateStatusMenu: (id: number, body: UpdateMenuBodyType) => void;
}>({
  updateStatusMenu: (id: number, body: UpdateMenuBodyType) => {},
});

export default function MenuTable() {
  const t = useTranslations("ManageMenus");
  const columns = getColumns(t);
  const router = useRouter();
  const queryParams = useQueryParams();
  const socket = useAppStore((state) => state.socket);

  const limit = queryParams.limit ? Number(queryParams.limit) : 5;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: MenuQueryType = omitBy(
    {
      page,
      limit,
      name: queryParams.name ? queryParams.name : undefined,
    },
    isUndefined,
  ) as MenuQueryType;

  const form = useForm<SearchMenuType>({
    resolver: zodResolver(SearchMenu),
    defaultValues: {
      name: queryParams.name || "",
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, name: undefined })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset();
    router.push(`/manage/menus?${params.toString()}`);
  };

  const submit = (data: SearchMenuType) => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, page: 1, name: data.name })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/menus?${params.toString()}`);
  };

  const { data: listMenu, refetch } = useGetListMenuQuery(queryConfig);

  const data: MenuListResType["data"] = listMenu?.payload.data || [];
  const currentPage = listMenu?.payload.pagination.page || 0; // trang hiện tại
  const totalPages = listMenu?.payload.pagination.totalPages || 0; // tổng số trang
  const total = listMenu?.payload.pagination.total || 0; // tổng số item

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
  const updateStatusMenuMutation = useUpdateMenuMutation();

  const updateStatusMenu = async (id: number, body: UpdateMenuBodyType) => {
    try {
      await updateStatusMenuMutation.mutateAsync({ id, body });
      toast.success(t("updateStatusSuccess"), { duration: 2000 });
      await revalidateApiRequests("menus");
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  useEffect(() => {
    if (!socket) return;
    function updateMenuListener() {
      refetch();
      toast.success(t("menuUpdated"), { duration: 2000 });
    }
    socket.on("update-menu", updateMenuListener);
    return () => {
      socket.off("update-menu", updateMenuListener);
    };
  }, [socket, listMenu, t, refetch]);

  return (
    <MenuTableContext.Provider value={{ updateStatusMenu }}>
      <div className="w-full">
        <div className="bg-[#fffbe6] rounded-lg flex items-center gap-2 p-4 mb-2">
          <div className="p-2 rounded-full bg-yellow-500 inline-block">
            <CircleAlert size={16} />
          </div>
          <p className="text-black text-sm">{t("note")}</p>
        </div>

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

              <Button variant="outline" size="icon" type="reset">
                <X />
              </Button>

              <Button variant="outline" size="icon" className="bg-blue-500!" type="submit">
                <Search color="white" />
              </Button>
            </form>
          </Form>

          <div className="ml-auto flex items-center gap-2">
            <AddMenu />
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
            {t("showingOf", { count: data.length, total })}
          </div>
          <div>
            <AutoPagination
              queryConfig={queryConfig}
              page={currentPage} // trang hiện tại
              totalPages={totalPages} // tổng số trang
              pathname="/manage/menus"
            />
          </div>
        </div>
      </div>
    </MenuTableContext.Provider>
  );
}
