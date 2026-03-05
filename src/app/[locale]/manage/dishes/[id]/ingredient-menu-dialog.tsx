/* eslint-disable react-hooks/incompatible-library */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
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
import { IngredientListResType } from "@/schemaValidations/ingredient.schema";
import { useGetListIngredientQuery } from "@/queries/useIngredient";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export type IngredientItem = IngredientListResType["data"][0];
export const getColumns = (t: (key: string) => string): ColumnDef<IngredientItem>[] => [
  {
    id: "image",
    header: () => t("image"),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.image ? (
          <Image
            src={row.original.image}
            alt={row.original.name}
            width={48}
            height={48}
            className="rounded-md object-cover w-12 h-12"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
            No Image
          </div>
        )}
      </div>
    ),
  },
  {
    id: "name",
    header: () => t("nameIngredient"),
    cell: ({ row }) => <div className="font-semibold">{row.original.name}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(String(row.original.name), String(filterValue));
    },
  },
  {
    id: "category",
    header: () => t("category"),
    cell: ({ row }) => <div className="capitalize">{row.original.category || "—"}</div>,
  },
  {
    id: "allergenType",
    header: () => t("allergenType"),
    cell: ({ row }) => <div>{row.original.allergenType || "—"}</div>,
  },
  {
    id: "isVegetarian",
    header: () => t("isVegetarian"),
    cell: ({ row }) =>
      row.original.isVegetarian ? (
        <span className="text-green-600 font-medium">{t("yes")}</span>
      ) : (
        <span className="text-gray-400">{t("no")}</span>
      ),
  },
  {
    id: "isVegan",
    header: () => t("isVegan"),
    cell: ({ row }) =>
      row.original.isVegan ? (
        <span className="text-green-600 font-medium">{t("yes")}</span>
      ) : (
        <span className="text-gray-400">{t("no")}</span>
      ),
  },
  {
    id: "isActive",
    header: () => t("status"),
    cell: ({ row }) =>
      row.original.isActive ? (
        <span className="text-blue-600 font-medium">{t("inStock")}</span>
      ) : (
        <span className="text-red-500 font-medium">{t("outOfStock")}</span>
      ),
  },
  {
    id: "description",
    header: () => t("description2"),
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground max-w-60 whitespace-normal">
        {row.original.description || "—"}
      </div>
    ),
  },
];

const PAGE_SIZE = 1000;
export default function IngredientsMenuDialog({
  onChoose,
  listIdIngredient,
}: {
  onChoose: (dish: IngredientItem) => void;
  listIdIngredient: number[];
}) {
  const t = useTranslations("ManageDishes");
  const columns = getColumns(t as (key: string) => string);
  const [open, setOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const listDishQuery = useGetListIngredientQuery({
    pagination: "false",
    page: 1,
    limit: 5, // nếu pagination = false thì page và limit không có ý nghĩa
  });
  const data = listDishQuery.data?.payload.data || [];
  const [selectedTab, setSelectedTab] = useState("gia-vi");
  const dataFiltered = data
    .filter((ingredient) => !listIdIngredient.includes(ingredient.id))
    .filter((item) => item.category === selectedTab); // lọc những món đã có trong menu

  const table = useReactTable({
    data: dataFiltered,
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
        <Button variant="outline">{t("change")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-230">
        <DialogHeader>
          <DialogTitle>{t("chooseIngredient")}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="flex items-center py-4">
              <Input
                placeholder={t("filterName")}
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            </div>

            <span className="block pb-4 text-sm italic">{t("note")}</span>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-4">
              <TabsList variant="line">
                <TabsTrigger value="gia-vi">{t("categorySpice")}</TabsTrigger>
                <TabsTrigger value="thit-ca">{t("categoryMeat")}</TabsTrigger>
                <TabsTrigger value="rau-cu">{t("categoryVegetable")}</TabsTrigger>
                <TabsTrigger value="khac">{t("categoryOther")}</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="rounded-md border h-75 overflow-auto">
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
                        onClick={() => choose(row.original)}
                        className="cursor-pointer"
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
                Hiển thị <strong>{data.length}</strong> kết quả
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
