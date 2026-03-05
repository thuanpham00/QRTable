/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import FormEditMenu from "@/app/[locale]/manage/menus/[id]/form-edit-menu";
import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useDeleteMenuItemMutation, useGetListItemMenuFromMenu } from "@/queries/useMenu";
import { MenuItemListResType } from "@/schemaValidations/menu.schema";
import { cn, formatCurrency, formatDateTimeToLocaleString } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AddDishToMenuForm from "@/app/[locale]/manage/menus/[id]/add-dish-to-menu";
import EditDishToMenuForm from "@/app/[locale]/manage/menus/[id]/edit-dish-to-menu";
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
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useGetListDishCategoryNameQuery } from "@/queries/useDishCategory";
import { useAppStore } from "@/components/app-provider";
import revalidateApiRequests from "@/apiRequests/revalidate";
import { useTranslations } from "next-intl";

// sử dụng trong phạm vị component AccountTable và các component con của nó
const MenuTableContext = createContext<{
  setMenuItemIdEdit: (value: number) => void;
  menuItemIdEdit: number | undefined;
  menuItemDelete: MenuItem | null;
  setMenuItemDelete: (value: MenuItem | null) => void;
}>({
  setMenuItemIdEdit: (value: number | undefined) => {},
  menuItemIdEdit: undefined,
  menuItemDelete: null,
  setMenuItemDelete: (value: MenuItem | null) => {},
});

type MenuItem = MenuItemListResType["data"]["itemList"][0];
const getColumns = (t: any) => {
  const columns: ColumnDef<MenuItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">#{row.getValue("id")}</div>,
    },
    {
      id: "dishImage",
      header: () => <div className="text-center">{t("image")}</div>,
      cell: ({ row }) => {
        const dish = row.original.dish;
        return (
          <div className="flex justify-center">
            <Image
              src={dish.image}
              alt={dish.name}
              width={60}
              height={60}
              className="rounded-md object-cover w-15 h-15"
            />
          </div>
        );
      },
    },
    {
      id: "dishName",
      header: t("nameDish"),
      cell: ({ row }) => {
        const dish = row.original.dish;
        return (
          <div>
            <div className="font-medium">{dish.name}</div>
            <p className="text-sm text-muted-foreground max-w-75 whitespace-normal">{dish.description}</p>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue: string) => {
        if (!filterValue) return true;
        const dishName = row.original.dish.name.toLowerCase();
        return dishName.includes(filterValue.toLowerCase());
      },
    },
    {
      id: "price",
      header: t("menuPrice"),
      cell: ({ row }) => {
        const menuItemPrice = row.original.price;

        return (
          <div className="space-y-1">
            <div className={`font-medium text-orange-500 text-lg`}>{formatCurrency(menuItemPrice)}</div>
          </div>
        );
      },
    },
    {
      id: "price_base",
      header: t("basePrice"),
      cell: ({ row }) => {
        const dishPrice = row.original.dish.price;

        return (
          <div className="space-y-1">
            <div className={`font-medium }`}>{formatCurrency(dishPrice)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: t("category"),
      cell: ({ row }) => {
        const dish = row.original.dish;
        return <div className="underline font-semibold">{dish.category.name}</div>;
      },
      filterFn: (row, columnId, filterValue) => {
        // row.original.dish.category.id là số, filterValue là string
        return filterValue ? row.original.dish.category.id.toString() === filterValue : true;
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">{t("status")}</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusMap: Record<string, { label: string; variant: string }> = {
          Available: { label: t("available"), variant: "default" },
          OutOfStock: { label: t("outOfStock"), variant: "destructive" },
          Hidden: { label: t("hidden"), variant: "secondary" },
        };
        const statusInfo = statusMap[status] || { label: status, variant: "default" };

        return (
          <div className="flex justify-center">
            <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
          </div>
        );
      },
    },
    {
      id: "notes",
      header: t("notes"),
      cell: ({ row }) => {
        const notes = row.original.notes;
        return <div className="max-w-50 truncate">{notes || "-"}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: t("createdAt"),
      cell: ({ row }) => (
        <div className="text-sm">{formatDateTimeToLocaleString(row.getValue("createdAt"))}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">{t("actions")}</div>,
      cell: function Actions({ row }) {
        const { setMenuItemIdEdit, setMenuItemDelete } = useContext(MenuTableContext);
        const openEditMenuItem = () => {
          setMenuItemIdEdit(row.original.id);
        };
        const openDeleteMenuItem = () => {
          setMenuItemDelete(row.original);
        };
        return (
          <div className="flex justify-center gap-2">
            <Button size="sm" className="bg-red-500 hover:bg-red-400 text-white" onClick={openDeleteMenuItem}>
              {t("removeFromMenu")}
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-400 text-white" onClick={openEditMenuItem}>
              {t("edit")}
            </Button>
          </div>
        );
      },
    },
  ];
  return columns;
};

function AlertDialogDeleteMenuItem({
  menuItemDelete,
  setMenuItemDelete,
}: {
  menuItemDelete: MenuItem | null;
  setMenuItemDelete: (value: MenuItem | null) => void;
}) {
  const t = useTranslations("ManageMenus");
  const deleteMenuItemMutation = useDeleteMenuItemMutation();

  const handleDelete = async () => {
    if (menuItemDelete) {
      const {
        payload: { message },
      } = await deleteMenuItemMutation.mutateAsync(menuItemDelete.id);
      toast.success(message, {
        duration: 2000,
      });
      await revalidateApiRequests("menus");
      setMenuItemDelete(null);
    }
  };

  return (
    <AlertDialog
      open={Boolean(menuItemDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setMenuItemDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteMenuItemTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteMenuItemDesc", {
              name: menuItemDelete?.dish.name as string,
              menuId: menuItemDelete?.menuId as number,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setMenuItemDelete(null)}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{t("continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const PAGE_SIZE = 10;
const pageIndex = 0;
export default function MenuDetail() {
  const t = useTranslations("ManageMenus");
  const columns = getColumns(t);
  const socket = useAppStore((state) => state.socket);
  const params = useParams();
  const id = params.id as string;
  const listMenuItemQuery = useGetListItemMenuFromMenu(Number(id));
  const data = listMenuItemQuery.data?.payload.data.itemList || [];

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

  const [menuItemIdEdit, setMenuItemIdEdit] = useState<number>();
  const [menuItemDelete, setMenuItemDelete] = useState<MenuItem | null>(null);
  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  const listNameDishCategory = useGetListDishCategoryNameQuery();
  const dishCategories = listNameDishCategory.data?.payload.data || [];

  useEffect(() => {
    if (!socket) return;
    function updateMenuItemListener() {
      listMenuItemQuery.refetch();
      toast.success(t("menuItemUpdated"), { duration: 2000 });
    }
    socket.on("update-menu-item", updateMenuItemListener);
    return () => {
      socket.off("update-menu-item", updateMenuItemListener);
    };
  }, [socket, listMenuItemQuery, t]);

  return (
    <MenuTableContext.Provider
      value={{ setMenuItemIdEdit, menuItemIdEdit, menuItemDelete, setMenuItemDelete }}
    >
      <FormEditMenu idMenu={Number(id)} />
      <EditDishToMenuForm id={menuItemIdEdit} setId={setMenuItemIdEdit} dataMenuItemsCurrent={data} />
      <AlertDialogDeleteMenuItem menuItemDelete={menuItemDelete} setMenuItemDelete={setMenuItemDelete} />

      <div>
        <div className="w-full h-px bg-[#2e2f2f] my-8"></div>
        <div className="flex items-center mb-6">
          <div className="text-lg font-semibold">
            {t("nameListDish", {
              length: data.length,
            })}
          </div>
          <div className="ml-auto">
            <AddDishToMenuForm idMenu={Number(id)} dataMenuItemsCurrent={data} />
          </div>
        </div>

        <Input
          placeholder={t("filterNameDish")}
          value={(table.getColumn("dishName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("dishName")?.setFilterValue(event.target.value)}
          className="max-w-80 mb-4 mr-2"
        />

        <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openStatusFilter}
              className="w-37.5 text-sm justify-between"
            >
              {(() => {
                const filterValue = table.getColumn("category")?.getFilterValue();
                if (!filterValue) return t("categoryFilter");
                const found = dishCategories.find((cat) => cat.id.toString() === String(filterValue));
                return found ? found.name : String(filterValue);
              })()}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-50 p-0">
            <Command>
              <CommandGroup>
                <CommandList>
                  {dishCategories.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id.toString()}
                      onSelect={(currentValue: string) => {
                        table
                          .getColumn("category")
                          ?.setFilterValue(
                            currentValue === table.getColumn("category")?.getFilterValue()
                              ? ""
                              : currentValue,
                          );
                        setOpenStatusFilter(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          table.getColumn("category")?.getFilterValue() === item.id.toString()
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

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
            {t("showingOf", { count: table.getPaginationRowModel().rows.length, total: data.length })}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      </div>
    </MenuTableContext.Provider>
  );
}
