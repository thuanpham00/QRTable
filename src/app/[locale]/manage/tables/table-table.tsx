/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createContext, useState } from "react";
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
import { getTableLink, getVietnameseTableStatus } from "@/lib/utils";
import { useRouter } from "@/i18n/routing";
import AutoPagination from "@/components/auto-pagination";
import {
  SearchTable,
  SearchTableType,
  TableListResType,
  TableQueryType,
} from "@/schemaValidations/table.schema";
import EditTable from "@/app/[locale]/manage/tables/edit-table";
import AddTable from "@/app/[locale]/manage/tables/add-table";
import { useDeleteTableMutation, useGetListTableQuery } from "@/queries/useTable";
import QrCodeTable from "@/components/qrcode-table";
import { toast } from "sonner";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import { OrderModeType } from "@/constants/type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Search, X } from "lucide-react";
import { useAppStore } from "@/components/app-provider";
import { GuestCreateOrdersResType } from "@/schemaValidations/guest.schema";

type TableItem = TableListResType["data"][0];

const getTableStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "bg-green-100 text-green-800 border-green-300";
    case "Serving":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "Hidden":
      return "bg-red-500 text-white border-red-500";
    default:
      return "bg-red-500 text-white border-red-500";
  }
};

const TableTableContext = createContext<{
  setTableIdEdit: (value: number) => void;
  tableIdEdit: number | undefined;
  tableDelete: TableItem | null;
  setTableDelete: (value: TableItem | null) => void;
}>({
  setTableIdEdit: (value: number | undefined) => {},
  tableIdEdit: undefined,
  tableDelete: null,
  setTableDelete: (value: TableItem | null) => {},
});

function AlertDialogDeleteTable({
  tableDelete,
  setTableDelete,
}: {
  tableDelete: TableItem | null;
  setTableDelete: (value: TableItem | null) => void;
}) {
  const deleteTableMutation = useDeleteTableMutation();

  const handleDelete = async () => {
    if (tableDelete) {
      const {
        payload: { message },
      } = await deleteTableMutation.mutateAsync(tableDelete.number);
      toast.success(message, {
        duration: 2000,
      });
      setTableDelete(null);
    }
  };

  return (
    <AlertDialog
      open={Boolean(tableDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setTableDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa bàn ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Bàn{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">{tableDelete?.number}</span>{" "}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setTableDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function TableTable() {
  const socket = useAppStore((state) => state.socket);
  const router = useRouter();
  const queryParams = useQueryParams();

  const limit = queryParams.limit ? Number(queryParams.limit) : 10;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: TableQueryType = omitBy(
    {
      page,
      limit,
      number: queryParams.number ? queryParams.number : undefined,
    },
    isUndefined,
  ) as TableQueryType;

  const form = useForm<SearchTableType>({
    resolver: zodResolver(SearchTable),
    defaultValues: {
      number: queryParams.number || "",
    },
  });

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, number: undefined })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset();
    router.push(`/manage/tables?${params.toString()}`);
  };

  const submit = (data: SearchTableType) => {
    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, page: 1, number: data.number })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/tables?${params.toString()}`);
  };

  const [tableIdEdit, setTableIdEdit] = useState<number | undefined>();
  const [tableDelete, setTableDelete] = useState<TableItem | null>(null);

  const listTable = useGetListTableQuery(queryConfig);
  const data: TableListResType["data"] = listTable.data?.payload.data || [];
  const dataSortTypeQR = data.sort((a, b) => b.typeQR.localeCompare(a.typeQR));

  const currentPage = listTable.data?.payload.pagination.page || 0; // trang hiện tại
  const totalPages = listTable.data?.payload.pagination.totalPages || 0; // tổng số trang
  const total = listTable.data?.payload.pagination.total || 0; // tổng số item

  const openEditTable = (id: number) => {
    setTableIdEdit(id);
  };

  const openDeleteTable = (table: TableItem) => {
    setTableDelete(table);
  };

  return (
    <TableTableContext.Provider value={{ tableIdEdit, setTableIdEdit, tableDelete, setTableDelete }}>
      <div className="w-full">
        <EditTable id={tableIdEdit} setId={setTableIdEdit} />
        <AlertDialogDeleteTable tableDelete={tableDelete} setTableDelete={setTableDelete} />
        <div className="flex items-center pb-2">
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
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <Input placeholder="Lọc số bàn" className="max-w-sm" {...field} />
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
            <AddTable />
          </div>
        </div>
        <div>
          {dataSortTypeQR.length > 0 && (
            <div className="grid grid-cols-5 gap-4">
              {data.map((item) => (
                <div className="col-span-1 border rounded-md" key={item.number}>
                  <div className="flex flex-col items-start p-4 space-y-1">
                    <span className="text-lg font-semibold">
                      {item.typeQR === OrderModeType.DINE_IN ? `Bàn ${item.number}` : `Bàn mang đi`}
                    </span>
                    <QrCodeTable
                      token={item.token}
                      tableNumber={item.number}
                      width={200}
                      type={item.typeQR}
                    />
                    <span className="mt-1 block text-sm">
                      Sức chứa: <strong className="text-orange-500">{item.capacity}</strong> chỗ
                    </span>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span>Trạng thái:</span>
                      <Badge variant="outline" className={getTableStatusColor(item.status)}>
                        {getVietnameseTableStatus(item.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span>Loại bàn: </span>
                      <span
                        className={`text-sm ${item.typeQR === OrderModeType.DINE_IN ? "text-green-500" : "text-yellow-500"}`}
                      >
                        {item.typeQR === OrderModeType.DINE_IN ? "Ăn tại chỗ" : "Mang đi"}
                      </span>
                    </div>
                    <span className="mt-1 block text-sm h-10 line-clamp-2">
                      Ghi chú: {item.notes ? item.notes : "Không có ghi chú"}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-sm">
                      <span> Ngày tạo:</span>
                      <strong className="text-orange-500">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </strong>
                    </span>
                    <span className="mt-1 flex flex-col gap-1 text-sm">
                      <span>Link bàn:</span>
                      <span className="text-orange-200 break-all">
                        {getTableLink({
                          token: item.token as string,
                          tableNumber: item.number as number,
                          type: item.typeQR as string,
                        })}
                      </span>
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => openEditTable(item.number)}
                        className="bg-blue-500 hover:bg-blue-400 text-white"
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openDeleteTable(item)}
                        className="bg-red-500 hover:bg-red-400 text-white"
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              pathname="/manage/tables"
            />
          </div>
        </div>
      </div>
    </TableTableContext.Provider>
  );
}
