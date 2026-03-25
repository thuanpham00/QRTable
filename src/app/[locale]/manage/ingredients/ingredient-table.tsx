/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useDeleteIngredientMutation, useGetListIngredientQuery } from "@/queries/useIngredient";
import {
  IngredientListResType,
  IngredientQueryType,
  SearchIngredient,
  SearchIngredientType,
} from "@/schemaValidations/ingredient.schema";
import AddIngredient from "@/app/[locale]/manage/ingredients/add-ingredient";
import EditIngredient from "@/app/[locale]/manage/ingredients/edit-ingredient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

type IngredientItem = IngredientListResType["data"][0];

const getValuesCategory = (value: string) => {
  switch (value) {
    case "khac":
      return "Khác";
    case "thit-ca":
      return "Thịt cá";
    case "rau-cu":
      return "Rau củ";
    case "gia-vi":
      return "Gia vị";
  }
};

// sử dụng trong phạm vị component AccountTable và các component con của nó
const IngredientTableContext = createContext<{
  setIngredientIdEdit: (value: number) => void;
  ingredientIdEdit: number | undefined;
  ingredientDelete: IngredientItem | null;
  setIngredientDelete: (value: IngredientItem | null) => void;
}>({
  setIngredientIdEdit: (value: number | undefined) => {},
  ingredientIdEdit: undefined,
  ingredientDelete: null,
  setIngredientDelete: (value: IngredientItem | null) => {},
});

export const getColumns = (t: any) => {
  const columns: ColumnDef<IngredientItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "image",
      header: t("image"),
      cell: ({ row }) => {
        const src = row.getValue("image") as string;
        return (
          <Avatar className="aspect-square w-16 h-16 rounded-md object-cover">
            {src ? <AvatarImage src={src} /> : null}
            <AvatarFallback className="rounded-none">{row.original.name}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => <div className="capitalize font-semibold">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category",
      header: t("category"),
      cell: ({ row }) => (
        <div className="capitalize underline font-medium">
          {getValuesCategory(row.original.category as string) || "—"}
        </div>
      ),
    },
    {
      accessorKey: "allergenType",
      header: t("allergenType"),
      cell: ({ row }) => <div>{row.getValue("allergenType") || "—"}</div>,
    },
    {
      accessorKey: "unit",
      header: t("unit"),
      cell: ({ row }) => <div>{row.getValue("unit") || "—"}</div>,
    },
    {
      accessorKey: "isVegetarian",
      header: t("isVegetarian"),
      cell: ({ row }) =>
        row.getValue("isVegetarian") ? (
          <Badge className="bg-green-500 text-white">Có</Badge>
        ) : (
          <Badge variant="outline">Không</Badge>
        ),
    },
    {
      accessorKey: "isVegan",
      header: t("isVegan"),
      cell: ({ row }) =>
        row.getValue("isVegan") ? (
          <Badge className="bg-green-500 text-white">Có</Badge>
        ) : (
          <Badge variant="outline">Không</Badge>
        ),
    },
    {
      accessorKey: "isActive",
      header: t("isActive"),
      cell: ({ row }) =>
        row.getValue("isActive") ? (
          <Badge className="bg-blue-500 text-white">Còn</Badge>
        ) : (
          <Badge variant="destructive">Hết</Badge>
        ),
    },
    {
      accessorKey: "description",
      header: t("description2"),
      cell: ({ row }) => (
        <div className="whitespace-pre-line max-w-60 text-xs text-muted-foreground">
          {row.getValue("description") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "countDishUsed",
      header: t("countDishUsed"),
      cell: ({ row }) => (
        <div className="whitespace-pre-line max-w-15 text-center text-white">
          {typeof row.original.countDishUsed === "number" ? row.original.countDishUsed : "—"}
        </div>
      ),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: function Actions({ row }) {
        const { setIngredientIdEdit, setIngredientDelete } = useContext(IngredientTableContext);
        const openEditIngredient = () => {
          setIngredientIdEdit(row.original.id);
        };

        const openDeleteIngredient = () => {
          setIngredientDelete(row.original);
        };
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={openEditIngredient}
              className="bg-blue-500 hover:bg-blue-400 text-white"
            >
              {t("edit")}
            </Button>
            <Button
              size="sm"
              onClick={openDeleteIngredient}
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

function AlertDialogDeleteIngredient({
  ingredientDelete,
  setIngredientDelete,
}: {
  ingredientDelete: IngredientItem | null;
  setIngredientDelete: (value: IngredientItem | null) => void;
}) {
  const queryClient = useQueryClient();
  const t = useTranslations("ManageIngredients");
  const deleteIngredientMutation = useDeleteIngredientMutation();

  const handleDelete = async () => {
    if (ingredientDelete) {
      try {
        const {
          payload: { message },
        } = await deleteIngredientMutation.mutateAsync(ingredientDelete.id);
        toast.success(message, {
          duration: 2000,
        });
        setIngredientDelete(null);
        queryClient.invalidateQueries({ queryKey: ["inventory-stocks"] });
      } catch (error) {
        handleErrorApi({ errors: error });
      }
    }
  };

  return (
    <AlertDialog
      open={Boolean(ingredientDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setIngredientDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteIngredient")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteIngredientDesc")}{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {ingredientDelete?.name}
            </span>{" "}
            {t("deleteIngredientDesc2")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIngredientDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function IngredientTable() {
  const t = useTranslations("ManageIngredients");
  const router = useRouter();
  const queryParams = useQueryParams();
  const columns = getColumns(t);
  const limit = queryParams.limit ? Number(queryParams.limit) : 10;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: IngredientQueryType = omitBy(
    {
      page,
      limit,
      name: queryParams.name || undefined,
      category: queryParams.category || undefined,
      unit: queryParams.unit || undefined,
    },
    isUndefined,
  ) as IngredientQueryType;

  const form = useForm<SearchIngredientType>({
    resolver: zodResolver(SearchIngredient),
    defaultValues: {
      name: queryParams.name || "",
      category: queryParams.category || "",
      unit: queryParams.unit || "",
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, category: undefined, name: undefined, unit: undefined })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset();
    router.push(`/manage/ingredients?${params.toString()}`);
  };

  const submit = (data: SearchIngredientType) => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, page: 1, name: data.name, category: data.category, unit: data.unit })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/ingredients?${params.toString()}`);
  };

  const [ingredientIdEdit, setIngredientIdEdit] = useState<number | undefined>();
  const [ingredientDelete, setIngredientDelete] = useState<IngredientItem | null>(null);

  const { data: listIngredient, refetch } = useGetListIngredientQuery(queryConfig);

  const data: IngredientListResType["data"] = listIngredient?.payload.data || [];
  const currentPage = (listIngredient?.payload.pagination && listIngredient?.payload.pagination.page) || 0; // trang hiện tại
  const totalPages =
    (listIngredient?.payload.pagination && listIngredient?.payload.pagination.totalPages) || 0; // tổng số trang
  const total = (listIngredient?.payload.pagination && listIngredient?.payload.pagination.total) || 0; // tổng số item

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
    <IngredientTableContext.Provider
      value={{ ingredientIdEdit, setIngredientIdEdit, ingredientDelete, setIngredientDelete }}
    >
      <div className="w-full">
        <EditIngredient id={ingredientIdEdit} setId={setIngredientIdEdit} />
        <AlertDialogDeleteIngredient
          ingredientDelete={ingredientDelete}
          setIngredientDelete={setIngredientDelete}
        />

        <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm">
          <strong>{t("note")}:</strong> <br />
          <span className="font-semibold">{t("vegetarianLabel")}</span> (Vegetarian): {t("vegetarianNote")}
          <br />
          <span className="font-semibold">{t("veganLabel")}</span> (Vegan): {t("veganNote")}{" "}
          <span className="underline">{t("veganNoteHighlight")}</span>
        </div>

        <div className="flex items-center gap-2 py-4">
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder={t("filterCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rau-cu">{t("categoryVegetable")}</SelectItem>
                        <SelectItem value="thit-ca">{t("categoryMeat")}</SelectItem>
                        <SelectItem value="gia-vi">{t("categorySpice")}</SelectItem>
                        <SelectItem value="khac">{t("categoryOther")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder={t("filterUnit")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">{t("unit_kg")}</SelectItem>
                        <SelectItem value="liter">{t("unit_liter")}</SelectItem>
                        <SelectItem value="piece">{t("unit_piece")}</SelectItem>
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
            <AddIngredient />
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
              pathname="/manage/ingredients"
            />
          </div>
        </div>
      </div>
    </IngredientTableContext.Provider>
  );
}
