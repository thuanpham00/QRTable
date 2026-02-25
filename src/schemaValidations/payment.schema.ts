import { PaymentGroupSummaryRes } from "@/schemaValidations/tableSessions.schema";
import { PaginationRes } from "@/schemaValidations/util.schema";
import z from "zod";

export const SearchPayment = z
  .object({
    fromDate: z.union([z.string(), z.date()]).optional(),
    toDate: z.union([z.string(), z.date()]).optional(),
    paymentMethod: z.enum(["CASH", "SEPAY"]).optional(),
    numberTable: z.number().positive().optional(),
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

export type SearchPaymentType = z.TypeOf<typeof SearchPayment>;

// ============ Body Schemas ============
export const CreatePaymentBody = z
  .object({
    guestId: z.number().int().positive().optional(),
    tableNumber: z.number().int().positive().optional(),
    orderIds: z.array(z.number().int().positive()).min(1, "Phải có ít nhất 1 order"),
    totalAmount: z.number().int().positive("Số tiền phải lớn hơn 0"),
    paymentMethod: z.enum(["CASH", "SEPAY"]).default("SEPAY"),
    note: z.string().optional(),
  })
  .strict()
  .refine((data) => data.guestId || data.tableNumber, {
    message: "Phải cung cấp guestId hoặc tableNumber",
  });

export type CreatePaymentBodyType = z.infer<typeof CreatePaymentBody>;

// ============ Body Schemas ============
export const CreatePaymentByTableBody = z
  .object({
    tableNumber: z.number().int().positive(),
    paymentMethod: z.enum(["CASH", "SEPAY"]).default("SEPAY"),
    guestIds: z.array(z.number().int().positive()),
  })
  .strict();

export type CreatePaymentByTableBodyType = z.infer<typeof CreatePaymentByTableBody>;

// ============ Param Schemas ============
export const PaymentIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

export type PaymentIdParamType = z.infer<typeof PaymentIdParam>;

export const SepayWebhookBody = z.object({
  id: z.number(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string(),
  code: z.string().nullable(),
  content: z.string(),
  transferType: z.enum(["in", "out"]),
  transferAmount: z.number(),
  accumulated: z.number().nullable(),
  subAccount: z.string().nullable(),
  referenceCode: z.string().nullable(),
  description: z.string().nullable(),
});

export type SepayWebhookBodyType = z.infer<typeof SepayWebhookBody>;

// ============ Query Schemas ============
export const GetPaymentsQuery = z.object({
  tableNumber: z.number().optional(),
  paymentMethod: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type GetPaymentsQueryType = z.infer<typeof GetPaymentsQuery>;

// ============ Data Schemas ============
export const BankInfoSchema = z.object({
  bankCode: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
  amount: z.number(),
  content: z.string(),
});

export const PaymentDataSchema = z.object({
  paymentId: z.number(),
  totalAmount: z.number(),
  status: z.string(),
  paymentMethod: z.string(),
  qrCodeUrl: z.string().optional(),
  bankInfo: BankInfoSchema.optional(),
  expiresIn: z.number().optional(),
});

export const PaymentStatusSchema = z.object({
  id: z.number(),
  status: z.string(),
  totalAmount: z.number(),
  paymentMethod: z.string(),
  sepayTransactionDate: z.date().nullable(),
  sepayGateway: z.string().nullable(),
  sepayReferenceCode: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PaymentItemSchema = z.object({
  id: z.number(),
  paymentMethod: z.string(),
  totalAmount: z.number(),
  status: z.string(),
  guestId: z.number().nullable(),
  tableNumber: z.number().nullable(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  guest: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable(),
  table: z
    .object({
      number: z.number(),
    })
    .nullable(),
  orders: z.array(
    z.object({
      id: z.number(),
      quantity: z.number(),
    }),
  ),
  createdBy: z.object({
    id: z.number(),
    name: z.string(),
  }),
  sepayTransactionId: z.number().nullable(),
  sepayReferenceCode: z.string().nullable(),
  sepayGateway: z.string().nullable(),
  sepayTransactionDate: z.date().nullable(),
  sepayContent: z.string().nullable(),
  paymentGroup: PaymentGroupSummaryRes.nullable(),
});

// ============ Response Schemas ============
export const CreatePaymentRes = z
  .object({
    message: z.string(),
    data: PaymentDataSchema,
  })
  .strict();

export type CreatePaymentResType = z.infer<typeof CreatePaymentRes>;

export const PaymentRes = z
  .object({
    data: PaymentItemSchema,
  })
  .strict();

export type PaymentResType = z.infer<typeof PaymentRes>;

export const PaymentListRes = z
  .object({
    data: z.array(PaymentItemSchema),
    pagination: PaginationRes,
  })
  .strict();

export type PaymentListResType = z.infer<typeof PaymentListRes>;

export const SepayWebhookRes = z
  .object({
    success: z.boolean(),
    message: z.string(),
  })
  .strict();

export type SepayWebhookResType = z.infer<typeof SepayWebhookRes>;

export const PaymentListResByTable = z
  .object({
    data: z.array(PaymentItemSchema),
    message: z.string(),
  })
  .strict();

export type PaymentListResByTableType = z.infer<typeof PaymentListResByTable>;
