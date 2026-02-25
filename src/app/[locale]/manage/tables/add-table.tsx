"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { getVietnameseOrderModeStatus, getVietnameseTableStatus, handleErrorApi } from "@/lib/utils";
import { CreateTableBody, CreateTableBodyType } from "@/schemaValidations/table.schema";
import { OrderModeType, OrderModeTypeValues, TableStatus, TableStatusValues } from "@/constants/type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddTableMutation } from "@/queries/useTable";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function AddTable() {
  const addTableMutation = useAddTableMutation();

  const [open, setOpen] = useState(false);
  const form = useForm<CreateTableBodyType>({
    resolver: zodResolver(CreateTableBody),
    defaultValues: {
      number: 0,
      capacity: 2,
      status: TableStatus.Hidden,
      notes: "",
      typeQR: OrderModeType.DINE_IN,
    },
  });

  const reset = () => {
    form.reset();
  };

  const submit = async (values: CreateTableBodyType) => {
    if (addTableMutation.isPending) return;
    try {
      const {
        payload: { message },
      } = await addTableMutation.mutateAsync(values);
      toast.success(message, {
        duration: 2000,
      });
      reset();
      setOpen(false);
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
        setOpen(value);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Thêm bàn</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-150 max-h-screen overflow-auto"
        onCloseAutoFocus={() => form.reset()}
      >
        <DialogHeader>
          <DialogTitle>Thêm bàn</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-table-form"
            onReset={reset}
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">Số hiệu bàn</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="number"
                          type="number"
                          className="w-full"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">Lượng khách cho phép</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="capacity"
                          className="w-full"
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="description">Trạng thái</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TableStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getVietnameseTableStatus(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="typeQR"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="description">Loại mã QR</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại mã QR" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {OrderModeTypeValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getVietnameseOrderModeStatus(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="notes">Ghi chú</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Textarea id="notes" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="reset" form="add-table-form">
            Xóa
          </Button>
          <Button type="submit" form="add-table-form" className="bg-blue-500 hover:bg-blue-400 text-white">
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
