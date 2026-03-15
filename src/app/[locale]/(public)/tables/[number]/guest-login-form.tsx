/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GuestLoginBody,
  GuestLoginBodyInputType,
  GuestLoginBodyType,
} from "@/schemaValidations/guest.schema";
import { useGuestLoginMutation } from "@/queries/useGuest";
import {
  generateSocket,
  handleErrorApi,
  setNameGuestFromLocalStorage,
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
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { LoaderIcon } from "lucide-react";

// Import constants
const DietaryPreferenceValues = [
  "vegetarian",
  "vegan",
  "low-carb",
  "gluten-free",
  "keto",
  "pescatarian",
] as const;

const DietaryPreferenceLabels = {
  vegetarian: "Chay",
  vegan: "Thuần chay",
  "low-carb": "Ít tinh bột",
  "gluten-free": "Không gluten",
  keto: "Keto",
  pescatarian: "Ăn hải sản",
};

const AllergenValues = [
  "shellfish",
  "dairy",
  "peanuts",
  "tree-nuts",
  "gluten",
  "soy",
  "eggs",
  "fish",
  "sesame",
  "mustard",
] as const;

const AllergenLabels = {
  shellfish: "Hải sản có vỏ",
  dairy: "Sữa/Bơ sữa",
  peanuts: "Đậu phộng",
  "tree-nuts": "Các loại hạt",
  gluten: "Gluten",
  soy: "Đậu nành",
  eggs: "Trứng",
  fish: "Cá",
  sesame: "Mè",
  mustard: "Mù tạt",
};

export default function GuestLoginForm() {
  const setSocket = useAppStore((state) => state.setSocket);
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);

  const t = useTranslations("LoginGuest");
  const searchParams = useSearchParams();
  const params = useParams();
  const tokenTable = searchParams.get("token");
  const typeQR = searchParams.get("typeQR") as OrderMode;

  const tableNumber = Number(params.number);
  const router = useRouter();
  const useGuestLogin = useGuestLoginMutation();
  const form = useForm<GuestLoginBodyInputType, any, GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: "",
      token: "",
      tableNumber: 1,
      allergyInfo: [],
      dietaryPreferences: [],
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
        name: result.payload.data.guest.name,
        tokenGuestId: result.payload.data.accessToken,
        tableNumber: tableNumber.toString(),
        orderTypeQR: typeQR || OrderModeType.DINE_IN, // cái này có thể bị đổi
        tableTypeQR: typeQR || OrderModeType.DINE_IN, // cái này thì không đổi
      });
      setTableNumberFromLocalStorage(tableNumber.toString());
      setOrderTypeQRFromLocalStorage(typeQR || OrderModeType.DINE_IN);
      setTableTypeQRFromLocalStorage(typeQR || OrderModeType.DINE_IN);
      setNameGuestFromLocalStorage(result.payload.data.guest.name);
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
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
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
                      <Label htmlFor="name">{t("nameGuest")}</Label>
                      <Input id="name" type="text" required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Dietary Preferences - Multi Checkbox */}

              <FormItem>
                <div className="mb-3">
                  <FormLabel className="text-base">Sở thích ăn uống (tùy chọn)</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Chọn các món ăn bạn ưa thích để được tư vấn phù hợp
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {DietaryPreferenceValues.map((item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="dietaryPreferences"
                      render={({ field }) => {
                        return (
                          <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item])
                                    : field.onChange(
                                        (field.value as string[])?.filter((value: string) => value !== item),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {DietaryPreferenceLabels[item]}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>

              {/* Allergy Info - Multi Checkbox */}
              <FormItem>
                <div className="mb-3">
                  <FormLabel className="text-base">Dị ứng thực phẩm (tùy chọn)</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Chọn các thực phẩm bạn dị ứng để tránh trong món ăn
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {AllergenValues.map((item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="allergyInfo"
                      render={({ field }) => {
                        return (
                          <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item as any)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item])
                                    : field.onChange(
                                        (field.value as string[])?.filter((value: string) => value !== item),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {AllergenLabels[item]}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>

              <Button type="submit" className="w-full">
                {useGuestLogin.isPending && <LoaderIcon className="h-5 w-5 animate-spin" />}{" "}
                {t("buttonLogin")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
