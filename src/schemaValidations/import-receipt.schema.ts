import { BaseQuery, PaginationRes } from "@/schemaValidations/util.schema";
import z from "zod";

export const SearchImportReceipt = z
  .object({
    supplierId: z.string().optional(),
    fromDate: z.union([z.string(), z.date()]).optional(),
    toDate: z.union([z.string(), z.date()]).optional(),
    status: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.fromDate || !data.toDate) return true;
      const from = typeof data.fromDate === "string" ? new Date(data.fromDate) : data.fromDate;
      const to = typeof data.toDate === "string" ? new Date(data.toDate) : data.toDate;
      return from <= to;
    },
    {
      message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc",
      path: ["fromDate"],
    },
  );

export type SearchImportReceiptType = z.TypeOf<typeof SearchImportReceipt>;

// Query params cho list ImportReceipt
export const ImportReceiptQuery = BaseQuery.and(
  z.object({
    supplierId: z.coerce.number().optional(), // Lọc theo nhà cung cấp
    status: z.enum(["Draft", "Completed", "Cancelled"]).optional(), // Lọc theo trạng thái
    fromDate: z.union([z.string(), z.date()]).optional(),
    toDate: z.union([z.string(), z.date()]).optional(),
    type: z.string().optional(), // Đến ngày
  }),
);

export type ImportReceiptQueryType = z.TypeOf<typeof ImportReceiptQuery>;

// Schema cho ImportReceiptItem trong body
export const ImportReceiptItemBodySchema = z
  .object({
    supplierIngredientId: z.number().min(1, "ingredientRequired"),
    quantity: z.number().positive("quantityMustBePositive"),
    unitPrice: z.number().positive("unitPriceMustBePositive"),
    unit: z.string().min(1, "unitRequired"),
    batchNumber: z.string().min(1, "batchNumberRequired").max(100, "batchNumberTooLong"),
    expiryDate: z.string().min(1, "expiryDateRequired"),
    note: z.string().max(500, "importItemNoteTooLong").optional(),
  })
  .refine(
    (data) => {
      if (!data.expiryDate) return true;
      const expiryDate = new Date(data.expiryDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate > now;
    },
    {
      message: "expiryDateMustBeFuture",
      path: ["expiryDate"],
    },
  );

export type ImportReceiptItemBodySchemaType = z.TypeOf<typeof ImportReceiptItemBodySchema>;

// Schema cho ImportReceiptItem response
export const ImportReceiptItemSchema = z.object({
  id: z.number(),
  importReceiptId: z.number(),
  supplierIngredientId: z.number(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  batchNumber: z.string().nullable(),
  expiryDate: z.date().nullable(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ingredientName: z.string().optional(),
  ingredientUnit: z.string().optional(),
  ingredientImage: z.string().optional(),
  ingredientCategory: z.string().optional(),
  supplierName: z.string().optional(),
});

export type ImportReceiptItemSchemaType = z.TypeOf<typeof ImportReceiptItemSchema>;

// Schema cho ImportReceipt (với items)
export const ImportReceiptSchema = z.object({
  id: z.number(),
  code: z.string(),
  supplierId: z.number(),
  importDate: z.date(),
  totalAmount: z.number(),
  status: z.string(),
  note: z.string().nullable(),
  createdBy: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  supplierName: z.string().optional(),
  createdByName: z.string().optional(),
  items: z.array(ImportReceiptItemSchema).optional(),
});

export type ImportReceiptSchemaType = z.TypeOf<typeof ImportReceiptSchema>;

// Body cho create ImportReceipt
export const CreateImportReceiptBody = z
  .object({
    supplierId: z.number().min(1, "supplierRequired"),
    importDate: z.string().min(1, "importDateRequired"),
    quantityIngredientImport: z.number().positive("quantityIngredientImportMustBePositive"),
    note: z.string().optional(),
    items: z.array(ImportReceiptItemBodySchema).min(1, "itemsRequired"),
  })
  .refine(
    (data) => {
      if (!data.importDate) return false;
      const importDate = new Date(data.importDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      importDate.setHours(0, 0, 0, 0);
      return importDate <= now;
    },
    {
      message: "importDateNotFuture",
      path: ["importDate"],
    },
  );

export type CreateImportReceiptBodyType = z.TypeOf<typeof CreateImportReceiptBody>;

// Response cho create
export const CreateImportReceiptRes = z.object({
  data: ImportReceiptSchema,
  message: z.string(),
});

export type CreateImportReceiptResType = z.TypeOf<typeof CreateImportReceiptRes>;

// Body cho update ImportReceipt
export const UpdateImportReceiptBody = z
  .object({
    supplierId: z.number().optional(),
    importDate: z.string().optional(),
    quantityIngredientImport: z.number().positive("quantityIngredientImportMustBePositive"),
    status: z.enum(["Draft", "Completed", "Cancelled"]).optional(),
    note: z.string().optional(),
    items: z.array(ImportReceiptItemBodySchema).optional(),
  })
  .refine(
    (data) => {
      if (!data.importDate) return true;
      const importDate = new Date(data.importDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      importDate.setHours(0, 0, 0, 0);
      return importDate <= now;
    },
    {
      message: "importDateNotFuture",
      path: ["importDate"],
    },
  );

export type UpdateImportReceiptBodyType = z.TypeOf<typeof UpdateImportReceiptBody>;

// Response cho update
export const UpdateImportReceiptRes = z.object({
  data: ImportReceiptSchema,
  message: z.string(),
});

export type UpdateImportReceiptResType = z.TypeOf<typeof UpdateImportReceiptRes>;

// Response cho get detail
export const GetImportReceiptDetailRes = z.object({
  data: ImportReceiptSchema,
  message: z.string(),
});

export type GetImportReceiptDetailResType = z.TypeOf<typeof GetImportReceiptDetailRes>;

// Response cho get list
export const GetImportReceiptListRes = z.object({
  data: z.array(ImportReceiptSchema),
  pagination: PaginationRes,
  message: z.string(),
});

export type GetImportReceiptListResType = z.TypeOf<typeof GetImportReceiptListRes>;

// Params cho get detail
export const ImportReceiptParams = z.object({
  id: z.coerce.number(),
});

export type ImportReceiptParamsType = z.TypeOf<typeof ImportReceiptParams>;

// Response cho delete
export const DeleteImportReceiptRes = z.object({
  message: z.string(),
});

export type DeleteImportReceiptResType = z.TypeOf<typeof DeleteImportReceiptRes>;
