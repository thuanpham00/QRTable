"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetListDishCategoryNameQuery } from "@/queries/useDishCategory";
import { DishQueryType } from "@/schemaValidations/dish.schema";
import { useRouter } from "@/i18n/routing";
import { Fragment } from "react/jsx-runtime";

export default function SelectCategory({ queryConfig }: { queryConfig: DishQueryType }) {
  const listNameDishCategory = useGetListDishCategoryNameQuery();
  const dishCategories = listNameDishCategory.data?.payload.data || [];
  const router = useRouter();

  return (
    <Fragment>
      <Select
        onValueChange={(val) => {
          const params = new URLSearchParams(
            Object.entries({ ...queryConfig, categoryId: val }).map(([key, value]) => [key, String(value)]),
          );
          router.push(`/manage/dishes?${params.toString()}`);
        }}
        value={queryConfig.categoryId?.toString() || ""}
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Chọn danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Danh mục</SelectLabel>
            {dishCategories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Fragment>
  );
}
