/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useParams } from "next/navigation";
import { createContext, useContext, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import Image from "next/image";
import FormEditDish from "@/app/[locale]/manage/dishes/[id]/form-edit-dish";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeleteDishIngredientMutation, useGetListDishIngredient } from "@/queries/useDish";
import { DishIngredientListResType } from "@/schemaValidations/dish.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddIngredientToDishForm from "@/app/[locale]/manage/dishes/[id]/add-ingredient-to-dish";
import EditIngredientToDishForm from "@/app/[locale]/manage/dishes/[id]/edit-ingredient-to-dish";
import { toast } from "sonner";
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

// sử dụng trong phạm vị component AccountTable và các component con của nó
const DishTableContext = createContext<{
  setDishItemIdEdit: (value: number) => void;
  dishItemIdEdit: number | undefined;
  dishItemDelete: DishIngredientItem | null;
  setDishItemDelete: (value: DishIngredientItem | null) => void;
}>({
  setDishItemIdEdit: (value: number | undefined) => {},
  dishItemIdEdit: undefined,
  dishItemDelete: null,
  setDishItemDelete: (value: DishIngredientItem | null) => {},
});

export type DishIngredientItem = DishIngredientListResType["data"][0];
const columns: ColumnDef<DishIngredientItem>[] = [
  {
    id: "id",
    header: "ID",
    cell: ({ row }) => <div className="text-center">{row.original.id}</div>,
  },
  {
    id: "ingredientImage",
    header: () => <div className="text-center">Hình ảnh</div>,
    cell: ({ row }) => {
      const ingredient = row.original.ingredient;
      return (
        <div className="flex justify-center">
          <Image
            src={ingredient.image}
            alt={ingredient.name}
            width={48}
            height={48}
            className="rounded-md object-cover w-12 h-12"
          />
        </div>
      );
    },
  },
  {
    id: "ingredientName",
    header: "Nguyên liệu",
    cell: ({ row }) => {
      const ingredient = row.original.ingredient;
      return (
        <div>
          <div className="font-medium">{ingredient.name}</div>
          <div className="text-xs text-muted-foreground max-w-60 whitespace-normal">
            {ingredient.description}
          </div>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (!filterValue) return true;
      const ingredientName = row.original.ingredient.name.toLowerCase();
      return ingredientName.includes(filterValue.toLowerCase());
    },
  },
  {
    id: "quantity",
    header: "Số lượng",
    cell: ({ row }) => <div className="font-semibold">{row.original.quantity}</div>,
  },
  {
    id: "unit",
    header: "Đơn vị",
    cell: ({ row }) => <div className="">{row.original.unit}</div>,
  },
  {
    id: "isMain",
    header: "Chính/Phụ",
    cell: ({ row }) => (
      <div>
        {row.original.isMain ? (
          <Badge variant="default">Chính</Badge>
        ) : (
          <Badge variant="secondary">Phụ</Badge>
        )}
      </div>
    ),
  },
  {
    id: "isOptional",
    header: "Tùy chọn",
    cell: ({ row }) => (
      <div>{row.original.isOptional ? <Badge variant="secondary">Tùy chọn</Badge> : "Không bắt buộc"}</div>
    ),
  },
  {
    id: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      <div>
        {row.original.ingredient.isActive ? (
          <Badge variant="secondary">Còn hàng</Badge>
        ) : (
          <Badge variant="destructive">Hết hàng</Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Hành động</div>,
    cell: function Actions({ row }) {
      const { setDishItemIdEdit, setDishItemDelete } = useContext(DishTableContext);
      const openEditMenuItem = () => {
        setDishItemIdEdit(row.original.id);
      };
      const openDeleteMenuItem = () => {
        setDishItemDelete(row.original);
      };
      return (
        <div className="flex justify-center gap-2">
          <Button size="sm" className="bg-red-500 hover:bg-red-400 text-white" onClick={openDeleteMenuItem}>
            Xóa khỏi món ăn
          </Button>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-400 text-white" onClick={openEditMenuItem}>
            Sửa
          </Button>
        </div>
      );
    },
  },
];

function AlertDialogDeleteDishIngredient({
  dishIngredientDelete,
  setDishIngredientDelete,
}: {
  dishIngredientDelete: DishIngredientItem | null;
  setDishIngredientDelete: (value: DishIngredientItem | null) => void;
}) {
  const deleteDishIngredientMutation = useDeleteDishIngredientMutation();

  const handleDelete = async () => {
    if (dishIngredientDelete) {
      const {
        payload: { message },
      } = await deleteDishIngredientMutation.mutateAsync(dishIngredientDelete.id);
      toast.success(message, {
        duration: 2000,
      });
      setDishIngredientDelete(null);
    }
  };

  return (
    <AlertDialog
      open={Boolean(dishIngredientDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishIngredientDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa nguyên liệu khỏi món ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Nguyên liệu{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {dishIngredientDelete?.ingredient.name}
            </span>{" "}
            sẽ bị xóa vĩnh viễn khỏi món ăn {dishIngredientDelete?.dishId}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDishIngredientDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const PAGE_SIZE = 10;
const pageIndex = 0;
export default function DishDetail() {
  const params = useParams();
  const id = params.id as string;
  const listIngredientForDish = useGetListDishIngredient(Number(id));
  const data = listIngredientForDish.data?.payload.data ?? [];

  // state mặc định của table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const table = useReactTable({
    data,
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

  const [dishItemIdEdit, setDishItemIdEdit] = useState<number>();
  const [dishItemDelete, setDishItemDelete] = useState<DishIngredientItem | null>(null);

  return (
    <DishTableContext.Provider
      value={{ setDishItemIdEdit, dishItemIdEdit, dishItemDelete, setDishItemDelete }}
    >
      <FormEditDish idDish={Number(id)} />
      <EditIngredientToDishForm
        id={dishItemIdEdit}
        setId={setDishItemIdEdit}
        dataIngredientForDishCurrent={data}
      />
      <AlertDialogDeleteDishIngredient
        dishIngredientDelete={dishItemDelete}
        setDishIngredientDelete={setDishItemDelete}
      />

      <div>
        <div className="w-full h-px bg-[#2e2f2f] my-8"></div>
        <div className="flex items-center mb-6">
          <div className="text-lg font-semibold">Danh sách nguyên liệu</div>
          <div className="ml-auto">
            <AddIngredientToDishForm idDish={Number(id)} dataIngredientForDishCurrent={data} />
          </div>
        </div>

        <Input
          placeholder="Tên nguyên liệu"
          value={(table.getColumn("ingredientName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("ingredientName")?.setFilterValue(event.target.value)}
          className="max-w-80 mb-4"
        />

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
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong{" "}
            <strong>{data.length}</strong> kết quả
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </DishTableContext.Provider>
  );
}
