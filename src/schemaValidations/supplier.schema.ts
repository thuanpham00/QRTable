import { BaseQuery, PaginationRes } from "@/schemaValidations/util.schema";
import z from "zod";

export const SearchSupplier = z.object({
  name: z.string().max(256).optional(),
  status: z.string().max(256).optional(),
});

export type SearchSupplierType = z.TypeOf<typeof SearchSupplier>;

export const SupplierQuery = BaseQuery.and(
  z.object({
    name: z.string().trim().max(256).optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    pagination: z.string().optional(),
  }),
);

export type SupplierQueryType = z.TypeOf<typeof SupplierQuery>;

export const SupplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  status: z.string(),
  note: z.string().nullable(),
  ingredientCount: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SupplierRes = z.object({
  data: SupplierSchema,
  message: z.string(),
});

export type SupplierResType = z.TypeOf<typeof SupplierRes>;

export const SupplierListRes = z.object({
  data: z.array(SupplierSchema),
  pagination: PaginationRes,
  message: z.string(),
});

export type SupplierListResType = z.TypeOf<typeof SupplierListRes>;

export const CreateSupplierBody = z.object({
  name: z.string().trim().min(2, { message: "nameTooShort" }).max(256, { message: "nameTooLong" }),
  code: z.string().trim().min(2, { message: "codeTooShort" }).max(50, { message: "codeTooLong" }),
  phone: z.string().trim().min(1, { message: "phoneRequired" }).max(11, { message: "phoneTooLong" }),
  address: z.string().trim().min(1, { message: "addressRequired" }).max(1000, { message: "addressTooLong" }),
  status: z.enum(["Active", "Inactive"]).default("Active").optional(),
  email: z.string().email({ message: "invalidEmail" }).max(256, { message: "emailTooLong" }).optional(),
  note: z.string().max(2000, { message: "noteTooLong" }).optional(),
});

export type CreateSupplierBodyType = z.TypeOf<typeof CreateSupplierBody>;

export const UpdateSupplierBody = z.object({
  name: z.string().trim().min(2, { message: "nameTooShort" }).max(256, { message: "nameTooLong" }).optional(),
  code: z.string().trim().min(2, { message: "codeTooShort" }).max(50, { message: "codeTooLong" }).optional(),
  phone: z.string().trim().max(20, { message: "phoneTooLong" }).optional(),
  address: z.string().trim().max(1000, { message: "addressTooLong" }).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  email: z.string().email({ message: "invalidEmail" }).max(256, { message: "emailTooLong" }).optional(),
  note: z.string().max(2000, { message: "noteTooLong" }).optional(),
});

export type UpdateSupplierBodyType = z.TypeOf<typeof UpdateSupplierBody>;

export const SupplierParams = z.object({
  id: z.coerce.number(),
});

export type SupplierParamsType = z.TypeOf<typeof SupplierParams>;

// Schema cho dropdown/select options
export const SupplierOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const SupplierOptionsRes = z.object({
  data: z.array(SupplierOptionSchema),
  message: z.string(),
});

export type SupplierOptionsResType = z.TypeOf<typeof SupplierOptionsRes>;
