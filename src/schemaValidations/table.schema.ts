import { OrderModeTypeValues, TableStatusValues } from "@/constants/type";
import { BaseQuery, PaginationRes } from "@/schemaValidations/util.schema";
import z from "zod";

export const SearchTable = z.object({
  number: z.string().max(256).optional(),
  status: z.enum(TableStatusValues).optional(),
});

export type SearchTableType = z.TypeOf<typeof SearchTable>;

export const TableQuery = BaseQuery.and(
  z.object({
    number: z.string().trim().max(256).optional(),
    status: z.enum(TableStatusValues).optional(),
    pagination: z.string().optional(),
  }),
);

export type TableQueryType = z.TypeOf<typeof TableQuery>;

export const CreateTableBody = z.object({
  number: z.number().positive({ message: "numberPositive" }),
  capacity: z.number().positive({ message: "capacityPositive" }),
  status: z.enum(TableStatusValues).optional(),
  notes: z.string().max(500, { message: "notesTooLong" }).optional(),
  typeQR: z.enum(OrderModeTypeValues),
});

export type CreateTableBodyType = z.TypeOf<typeof CreateTableBody>;

export const TableSchema = z.object({
  number: z.coerce.number(),
  capacity: z.coerce.number(),
  status: z.enum(TableStatusValues),
  token: z.string(),
  notes: z.string().nullable(),
  typeQR: z.enum(OrderModeTypeValues),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TableRes = z.object({
  data: TableSchema,
  message: z.string(),
});

export type TableResType = z.TypeOf<typeof TableRes>;

export const TableListRes = z.object({
  data: z.array(TableSchema),
  message: z.string(),
  pagination: PaginationRes,
});

export type TableListResType = z.TypeOf<typeof TableListRes>;

export const UpdateTableBody = z.object({
  changeToken: z.boolean(),
  capacity: z.number().positive({ message: "capacityPositive" }),
  status: z.enum(TableStatusValues).optional(),
  notes: z.string().max(500, { message: "notesTooLong" }).optional(),
  typeQR: z.enum(OrderModeTypeValues).optional(),
});

export type UpdateTableBodyType = z.TypeOf<typeof UpdateTableBody>;
export const TableParams = z.object({
  number: z.coerce.number(),
});
export type TableParamsType = z.TypeOf<typeof TableParams>;

export const CleanTableSchema = z.object({
  sessionId: z.number(),
  guestsLoggedOut: z.number(),
  tableNumber: z.number(),
});

export const CleanTableRes = z.object({
  data: CleanTableSchema,
  message: z.string(),
});

export type CleanTableResType = z.TypeOf<typeof CleanTableRes>;

export const CleanTableBody = z.object({
  tableNumber: z.coerce.number().positive(),
});

export type CleanTableBodyType = z.TypeOf<typeof CleanTableBody>;
