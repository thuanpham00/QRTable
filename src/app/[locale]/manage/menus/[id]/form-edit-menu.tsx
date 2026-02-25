/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useForm } from "react-hook-form";
import { useDeleteMenuMutation, useGetMenuDetailQuery, useUpdateMenuMutation } from "@/queries/useMenu";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { UpdateMenuBody, UpdateMenuBodyType } from "@/schemaValidations/menu.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { handleErrorApi } from "@/lib/utils";
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
import { useRouter } from "@/i18n/routing";
import revalidateApiRequests from "@/apiRequests/revalidate";

export default function FormEditMenu({ idMenu }: { idMenu: number }) {
  const menuDetail = useGetMenuDetailQuery({ id: Number(idMenu), enabled: Boolean(idMenu) });
  const dataMenuDetail = menuDetail.data?.payload.data;

  const updateMenuMutation = useUpdateMenuMutation();

  const form = useForm<UpdateMenuBodyType>({
    resolver: zodResolver(UpdateMenuBody),
    defaultValues: {
      name: "",
      description: "",
      version: 0,
      isActive: false,
    },
  });

  useEffect(() => {
    if (dataMenuDetail) {
      form.reset({
        name: dataMenuDetail.name,
        description: dataMenuDetail.description || "",
        version: dataMenuDetail.version,
        isActive: dataMenuDetail.isActive,
      });
    }
  }, [dataMenuDetail, form]);

  const submit = async (values: UpdateMenuBodyType) => {
    try {
      const { payload } = await updateMenuMutation.mutateAsync({ id: idMenu, body: values });
      toast.success(payload.message, { duration: 2000 });
      form.reset({
        ...values,
        version: payload.data.version,
      });
      await revalidateApiRequests("menus");
    } catch (error: any) {
      if (
        error?.payload?.message ===
        "Đã có menu khác đang được kích hoạt. Vui lòng tắt kích hoạt menu đó trước khi kích hoạt menu này."
      ) {
        form.setValue("isActive", false);
      }
      handleErrorApi({
        errors: error,
      });
    }
  };

  const reset = () => {
    form.reset();
  };

  const [openDialog, setOpenDialog] = useState(false);
  const deleteMenuMutation = useDeleteMenuMutation();
  const router = useRouter();
  const handleDeleteMenu = async () => {
    if (deleteMenuMutation.isPending) return;
    try {
      const {
        payload: { message },
      } = await deleteMenuMutation.mutateAsync(idMenu);
      toast.success(message, { duration: 2000 });
      setOpenDialog(false);
      router.push("/manage/menus");
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          noValidate
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="edit-menu-form"
          onReset={reset}
          onSubmit={form.handleSubmit(submit, (err) => {
            console.log(err);
          })}
        >
          <div className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="name">Tên Menu</Label>
                    <div className="col-span-3 w-full space-y-2">
                      <Input id="name" className="w-full" {...field} />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="description">Mô tả Menu</Label>
                    <div className="col-span-3 w-full space-y-2">
                      <Textarea id="description" className="w-full" {...field} />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="version">Phiên bản</Label>
                    <div className="col-span-3 w-full space-y-2">
                      <Input type="number" id="version" className="w-full" {...field} disabled />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <Label htmlFor="isActive">Trạng thái</Label>
                    <div className="col-span-3 w-full space-y-2">
                      <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-2">
          <Button variant="destructive" onClick={() => setOpenDialog(true)}>
            Xóa menu
          </Button>
          <Button type="reset" form="edit-menu-form">
            Hủy
          </Button>
          <Button type="submit" form="edit-menu-form" className="bg-blue-500 hover:bg-blue-400 text-white">
            Cập nhật
          </Button>
        </div>
      </Form>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Menu sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMenu}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
