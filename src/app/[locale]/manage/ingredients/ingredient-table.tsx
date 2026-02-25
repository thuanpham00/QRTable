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
import { Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";

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

export const columns: ColumnDef<IngredientItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "image",
    header: "Ảnh",
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
    header: "Tên nguyên liệu",
    cell: ({ row }) => <div className="capitalize font-semibold">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "Danh mục",
    cell: ({ row }) => (
      <div className="capitalize underline font-medium">
        {getValuesCategory(row.original.category as string) || "—"}
      </div>
    ),
  },
  {
    accessorKey: "allergenType",
    header: "Loại dị ứng",
    cell: ({ row }) => <div>{row.getValue("allergenType") || "—"}</div>,
  },
  {
    accessorKey: "isVegetarian",
    header: "Ăn chay",
    cell: ({ row }) =>
      row.getValue("isVegetarian") ? (
        <Badge className="bg-green-500 text-white">Có</Badge>
      ) : (
        <Badge variant="outline">Không</Badge>
      ),
  },
  {
    accessorKey: "isVegan",
    header: "Thuần chay",
    cell: ({ row }) =>
      row.getValue("isVegan") ? (
        <Badge className="bg-green-500 text-white">Có</Badge>
      ) : (
        <Badge variant="outline">Không</Badge>
      ),
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) =>
      row.getValue("isActive") ? (
        <Badge className="bg-blue-500 text-white">Còn</Badge>
      ) : (
        <Badge variant="destructive">Hết</Badge>
      ),
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => (
      <div className="whitespace-pre-line max-w-60 text-xs text-muted-foreground">
        {row.getValue("description") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "countDishUsed",
    header: "Món ăn sử dụng",
    cell: ({ row }) => (
      <div className="whitespace-pre-line max-w-15 text-center text-white">
        {typeof row.original.countDishUsed === "number" ? row.original.countDishUsed : "—"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Hành động",
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
          <Button size="sm" onClick={openEditIngredient} className="bg-blue-500 hover:bg-blue-400 text-white">
            Sửa
          </Button>
          <Button size="sm" onClick={openDeleteIngredient} className="bg-red-500 hover:bg-red-400 text-white">
            Xóa
          </Button>
        </div>
      );
    },
  },
];

function AlertDialogDeleteIngredient({
  ingredientDelete,
  setIngredientDelete,
}: {
  ingredientDelete: IngredientItem | null;
  setIngredientDelete: (value: IngredientItem | null) => void;
}) {
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
          <AlertDialogTitle>Xóa nguyên liệu?</AlertDialogTitle>
          <AlertDialogDescription>
            Nguyên liệu{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {ingredientDelete?.name}
            </span>{" "}
            sẽ bị xóa vĩnh viễn
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
  const router = useRouter();
  const queryParams = useQueryParams();

  const limit = queryParams.limit ? Number(queryParams.limit) : 10;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: IngredientQueryType = omitBy(
    {
      page,
      limit,
      name: queryParams.name || undefined,
      category: queryParams.category || undefined,
    },
    isUndefined,
  ) as IngredientQueryType;

  const form = useForm<SearchIngredientType>({
    resolver: zodResolver(SearchIngredient),
    defaultValues: {
      name: queryParams.name || "",
      category: queryParams.category || "",
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, category: undefined, name: undefined })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset();
    router.push(`/manage/ingredients?${params.toString()}`);
  };

  const submit = (data: SearchIngredientType) => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, page: 1, name: data.name, category: data.category })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/ingredients?${params.toString()}`);
  };

  const [ingredientIdEdit, setIngredientIdEdit] = useState<number | undefined>();
  const [ingredientDelete, setIngredientDelete] = useState<IngredientItem | null>(null);

  const listIngredient = useGetListIngredientQuery(queryConfig);

  const data: IngredientListResType["data"] = listIngredient.data?.payload.data || [];
  const currentPage =
    (listIngredient.data?.payload.pagination && listIngredient.data?.payload.pagination.page) || 0; // trang hiện tại
  const totalPages =
    (listIngredient.data?.payload.pagination && listIngredient.data?.payload.pagination.totalPages) || 0; // tổng số trang
  const total =
    (listIngredient.data?.payload.pagination && listIngredient.data?.payload.pagination.total) || 0; // tổng số item

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
          <strong>Lưu ý:</strong> <br />
          <span className="font-semibold">Ăn chay</span> (Vegetarian): Không ăn thịt động vật nhưng vẫn có thể
          dùng các sản phẩm từ động vật như trứng, sữa, mật ong...
          <br />
          <span className="font-semibold">Thuần chay</span> (Vegan): Không ăn thịt và{" "}
          <span className="underline">không sử dụng bất kỳ sản phẩm nào có nguồn gốc từ động vật</span> (bao
          gồm trứng, sữa, mật ong, gelatin, v.v.).
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
                    <Input placeholder="Lọc tên" className="max-w-sm" {...field} />
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
                        <SelectValue placeholder="Chọn nhóm nguyên liệu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rau-cu">Rau củ</SelectItem>
                        <SelectItem value="thit-ca">Thịt cá</SelectItem>
                        <SelectItem value="gia-vi">Gia vị</SelectItem>
                        <SelectItem value="khac">Khác</SelectItem>
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
            <AddIngredient />
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
