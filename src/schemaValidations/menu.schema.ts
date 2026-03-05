import { MenuItemStatusValues } from "@/constants/type";
import { DishSchema } from "@/schemaValidations/dish.schema";
import { BaseQuery, PaginationRes } from "@/schemaValidations/util.schema";
import z from "zod";

export const SearchMenu = z.object({
  name: z.string().max(256).optional(),
  categoryId: z.string().max(256).optional(),
});

export type SearchMenuType = z.TypeOf<typeof SearchMenu>;

export const MenuQuery = BaseQuery.and(
  z.object({
    name: z.string().trim().max(256).optional(),
  }),
);

export type MenuQueryType = z.TypeOf<typeof MenuQuery>;

export const MenuSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  version: z.number(),
  isActive: z.boolean(),
  countMenuItems: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MenuRes = z.object({
  data: MenuSchema,
  message: z.string(),
});

export type MenuResType = z.TypeOf<typeof MenuRes>;

export const MenuListRes = z.object({
  data: z.array(MenuSchema), // ← Array thay vì object
  pagination: PaginationRes,
  message: z.string(),
});

export type MenuListResType = z.TypeOf<typeof MenuListRes>;

export const MenuParams = z.object({
  id: z.coerce.number(),
});
export type MenuParamsType = z.TypeOf<typeof MenuParams>;

export const CreateMenuBody = z.object({
  name: z.string().min(5, { message: "nameTooShort" }).max(256, { message: "nameTooLong" }),
  description: z.string().max(10000, { message: "descriptionTooLong" }),
  version: z.number().min(1, { message: "versionMin" }),
  isActive: z.boolean(),
});

export type CreateMenuBodyType = z.TypeOf<typeof CreateMenuBody>;

export const UpdateMenuBody = CreateMenuBody;

export type UpdateMenuBodyType = z.TypeOf<typeof UpdateMenuBody>;

export const MenuItemSchema = z.object({
  id: z.number(),
  menuId: z.number(),
  dishId: z.number(),
  price: z.coerce.number(),
  status: z.enum(MenuItemStatusValues),
  dish: DishSchema,
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MenuItemRes = z.object({
  data: MenuItemSchema,
  message: z.string(),
});

export type MenuItemResType = z.TypeOf<typeof MenuItemRes>;

export const MenuItemListRes = z.object({
  data: z.object({
    itemList: z.array(MenuItemSchema),
    menu: MenuSchema,
  }),
  message: z.string(),
});

export type MenuItemListResType = z.TypeOf<typeof MenuItemListRes>;

export const MenuItemSuggestRes = z.object({
  data: z.array(MenuItemSchema),
  message: z.string(),
});

export type MenuItemSuggestResType = z.TypeOf<typeof MenuItemSuggestRes>;

export const AddDishToMenu = z.object({
  dishId: z.number().min(1, { message: "dishIdRequired" }),
  price: z.number().min(1000, { message: "priceTooLow" }),
  notes: z.string().max(1000, { message: "notesTooLong" }).optional(),
  status: z.enum(MenuItemStatusValues),
});

export type AddDishToMenuType = z.TypeOf<typeof AddDishToMenu>;

export const UpdateDishInMenu = AddDishToMenu;

export type UpdateDishInMenuType = z.TypeOf<typeof UpdateDishInMenu>;

export const MenuActive = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  version: z.number(),
  isActive: z.boolean(),
  menuItems: z.array(MenuItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MenuActiveRes = z.object({
  data: MenuActive,
  message: z.string(),
});

export type MenuActiveResType = z.TypeOf<typeof MenuActiveRes>;
