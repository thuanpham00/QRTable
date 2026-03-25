/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createContext, useState } from "react";
import { formatCurrency, getVietnameseDishStatus } from "@/lib/utils";
import AutoPagination from "@/components/auto-pagination";
import { DishListResType, DishQueryType, SearchDish, SearchDishType } from "@/schemaValidations/dish.schema";
import AddDish from "@/app/[locale]/manage/dishes/add-dish";
import { useGetListDishQuery } from "@/queries/useDish";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import { DishStatus } from "@/constants/type";
import { Badge } from "@/components/ui/badge";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem } from "@/components/ui/form";
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
import { useGetListDishCategoryNameQuery } from "@/queries/useDishCategory";
import { useTranslations } from "next-intl";

type DishItem = DishListResType["data"][0];

const getDishStatusColor = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Active:
      return "bg-green-500 text-white hover:bg-green-600";
    case DishStatus.Discontinued:
      return "bg-yellow-500 text-white hover:bg-yellow-600";
    default:
      return "bg-yellow-500 text-white hover:bg-yellow-600";
  }
};

// sử dụng trong phạm vị component AccountTable và các component con của nó
const DishTableContext = createContext<{
  setDishIdEdit: (value: number) => void;
  dishIdEdit: number | undefined;
  dishDelete: DishItem | null;
  setDishDelete: (value: DishItem | null) => void;
}>({
  setDishIdEdit: (value: number | undefined) => {},
  dishIdEdit: undefined,
  dishDelete: null,
  setDishDelete: (value: DishItem | null) => {},
});

export const getColumns = (t: any) => {
  const columns: ColumnDef<DishItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "image",
      header: t("image"),
      cell: ({ row }) => (
        <div>
          <Avatar className="aspect-square w-28 h-25 rounded-md object-cover">
            <AvatarImage src={row.getValue("image")} />
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
      accessorKey: "category",
      header: t("category"),
      cell: ({ row }) => {
        const category = row.getValue("category") as { name: string };
        return <div className="capitalize underline font-semibold">{category.name}</div>;
      },
    },
    {
      accessorKey: "price",
      header: t("price"),
      cell: ({ row }) => <div className="capitalize">{formatCurrency(row.getValue("price"))}</div>,
    },
    {
      accessorKey: "preparationTime",
      header: t("preparationTime"),
      cell: ({ row }) => (
        <div className="capitalize text-center">
          {row.getValue("preparationTime")} {t("preparationTimeUnit")}
        </div>
      ),
    },
    {
      accessorKey: "popularity",
      header: t("popularity"),
      cell: ({ row }) => <div className="capitalize text-center">{row.getValue("popularity")}</div>,
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as any;
        return <Badge className={getDishStatusColor(status)}>{getVietnameseDishStatus(status)}</Badge>;
      },
    },
    {
      accessorKey: "description",
      header: t("description2"),
      cell: ({ row }) => (
        <div
          dangerouslySetInnerHTML={{ __html: row.getValue("description") }}
          className="whitespace-pre-line w-full max-w-75"
        />
      ),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: function Actions({ row }) {
        return (
          <div>
            <Link
              href={`/manage/dishes/${row.original.id}`}
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

export default function DishTable() {
  const router = useRouter();
  const queryParams = useQueryParams();
  const t = useTranslations("ManageDishes");
  const columns = getColumns(t);
  const page = queryParams.page ? Number(queryParams.page) : 1;
  const limit = queryParams.limit ? Number(queryParams.limit) : 5;

  const queryConfig: DishQueryType = omitBy(
    {
      page,
      limit,
      name: queryParams.name || undefined,
      categoryId: queryParams.categoryId || undefined,
    },
    isUndefined,
  ) as DishQueryType;

  const form = useForm<SearchDishType>({
    resolver: zodResolver(SearchDish),
    defaultValues: {
      name: queryParams.name || "",
      categoryId: queryParams.categoryId || "",
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, categoryId: undefined, name: undefined })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset();
    router.push(`/manage/dishes?${params.toString()}`);
  };

  const submit = (data: SearchDishType) => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, page: 1, name: data.name, categoryId: data.categoryId })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/dishes?${params.toString()}`);
  };

  const [dishIdEdit, setDishIdEdit] = useState<number | undefined>();
  const [dishDelete, setDishDelete] = useState<DishItem | null>(null);

  const { data: listDish, refetch } = useGetListDishQuery(queryConfig);

  const data: DishListResType["data"] = listDish?.payload.data || [];
  const currentPage = (listDish?.payload.pagination && listDish?.payload.pagination.page) || 0; // trang hiện tại
  const totalPages = (listDish?.payload.pagination && listDish?.payload.pagination.totalPages) || 0; // tổng số trang
  const total = (listDish?.payload.pagination && listDish?.payload.pagination.total) || 0; // tổng số item

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

  const listNameDishCategory = useGetListDishCategoryNameQuery();
  const dishCategories = listNameDishCategory.data?.payload.data || [];

  return (
    <DishTableContext.Provider value={{ dishIdEdit, setDishIdEdit, dishDelete, setDishDelete }}>
      <div className="w-full">
        <div className="flex items-center justify-between">
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="w-45">
                        <SelectValue placeholder={t("chooseCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>{t("category")}</SelectLabel>
                          {dishCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
            <AddDish />
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
            Hiển thị <strong>{data.length}</strong> trong <strong>{total}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              queryConfig={queryConfig}
              page={currentPage} // trang hiện tại
              totalPages={totalPages} // tổng số trang
              pathname="/manage/dishes"
            />
          </div>
        </div>
      </div>
    </DishTableContext.Provider>
  );
}
