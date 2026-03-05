import { BaseQuery, PaginationRes } from "@/schemaValidations/util.schema";
import z from "zod";

export const SearchCategoryDish = z.object({
  name: z.string().max(256).optional(),
});

export type SearchCategoryDishType = z.TypeOf<typeof SearchCategoryDish>;

export const DishCategoryQuery = BaseQuery.and(
  z.object({
    name: z.string().trim().max(256).optional(),
  }),
);

export type DishCategoryQueryType = z.TypeOf<typeof DishCategoryQuery>;

export const DishCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  countDish: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DishCategoryRes = z.object({
  data: DishCategorySchema,
  message: z.string(),
});

export type DishCategoryResType = z.TypeOf<typeof DishCategoryRes>;

export const DishCategoryListRes = z.object({
  data: z.array(DishCategorySchema), // ← Array thay vì object
  pagination: PaginationRes,
  message: z.string(),
});

export type DishCategoryListResType = z.TypeOf<typeof DishCategoryListRes>;

export const DishCategoryNameSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type DishCategoryNameResType = z.TypeOf<typeof DishCategoryNameSchema>;

export const DishCategoryNameListRes = z.object({
  data: z.array(DishCategoryNameSchema), // ← Array thay vì object
  message: z.string(),
});

export type DishCategoryNameListResType = z.TypeOf<typeof DishCategoryNameListRes>;

export const CreateDishCategoryBody = z.object({
  name: z.string().min(5, { message: "nameTooShort" }).max(256, { message: "nameTooLong" }),
  description: z.string().max(10000, { message: "descriptionTooLong" }),
});

export type CreateDishCategoryBodyType = z.TypeOf<typeof CreateDishCategoryBody>;

export const UpdateDishCategoryBody = CreateDishCategoryBody;

export type UpdateDishCategoryBodyType = z.TypeOf<typeof UpdateDishCategoryBody>;
