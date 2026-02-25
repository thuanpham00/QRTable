"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GuestLoginBody, GuestLoginBodyType } from "@/schemaValidations/guest.schema";
import { useGuestLoginMutation } from "@/queries/useGuest";
import {
  generateSocket,
  handleErrorApi,
  setOrderTypeQRFromLocalStorage,
  setTableNumberFromLocalStorage,
  setTableTypeQRFromLocalStorage,
} from "@/lib/utils";
import { toast } from "sonner";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "@/components/app-provider";
import { OrderMode, OrderModeType } from "@/constants/type";
import { useRouter } from "@/i18n/routing";

export default function GuestLoginForm() {
  const setSocket = useAppStore((state) => state.setSocket);
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);

  const searchParams = useSearchParams();
  const params = useParams();
  const tokenTable = searchParams.get("token");
  const typeQR = searchParams.get("typeQR") as OrderMode;

  const tableNumber = Number(params.number);
  const router = useRouter();
  const useGuestLogin = useGuestLoginMutation();
  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: "",
      token: "",
      tableNumber: 1,
    },
  });

  const submit = async (values: GuestLoginBodyType) => {
    if (useGuestLogin.isPending) return;
    let body = values;
    body = {
      ...body,
      token: tokenTable || values.tableNumber.toString(),
      tableNumber: tableNumber || values.tableNumber,
    };
    try {
      const result = await useGuestLogin.mutateAsync(body);
      toast.success(result.payload.message, {
        duration: 2000,
      });
      setIsRole(result.payload.data.guest.role);
      setSocket(generateSocket(result.payload.data.accessToken)); // khởi tạo socket khi login thành công
      setInfoGuest({
        tokenGuestId: result.payload.data.accessToken,
        tableNumber: tableNumber.toString(),
        orderTypeQR: typeQR || OrderModeType.DINE_IN, // cái này có thể bị đổi
        tableTypeQR: typeQR || OrderModeType.DINE_IN, // cái này thì không đổi
      });
      setTableNumberFromLocalStorage(tableNumber.toString());
      setOrderTypeQRFromLocalStorage(typeQR || OrderModeType.DINE_IN);
      setTableTypeQRFromLocalStorage(typeQR || OrderModeType.DINE_IN);
      router.push("/guest/menu");
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  useEffect(() => {
    if (!tokenTable) {
      router.push("/");
    }
  }, [router, tokenTable]);

  return (
    <Card className="mx-auto max-w-100 w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập gọi món</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-2 shrink-0 w-full"
            noValidate
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Tên khách hàng</Label>
                      <Input id="name" type="text" required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Đăng nhập
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
