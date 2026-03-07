import { Role } from "@/constants/type";
import { LoginRes } from "@/schemaValidations/auth.schema";
import { BaseQuery, PaginationRes } from "@/schemaValidations/util.schema";
import z from "zod";

export const SearchAccount = z.object({
  email: z.string().max(256).optional(),
});

export type SearchAccountType = z.TypeOf<typeof SearchAccount>;

export const AccountQuery = BaseQuery.and(
  z.object({
    email: z.string().trim().max(256).optional(),
  }),
);

export type AccountQueryType = z.TypeOf<typeof AccountQuery>;

export const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.enum([Role.Owner, Role.Employee]),
  avatar: z.string().nullable(),
});

export type AccountType = z.TypeOf<typeof AccountSchema>;

export const AccountListRes = z.object({
  data: z.array(AccountSchema),
  message: z.string(),
  pagination: PaginationRes,
});

export type AccountListResType = z.TypeOf<typeof AccountListRes>;

export const AccountRes = z
  .object({
    data: AccountSchema,
    message: z.string(),
  })
  .strict();

export type AccountResType = z.TypeOf<typeof AccountRes>;

export const CreateEmployeeAccountBody = z
  .object({
    name: z.string().trim().min(2, { message: "nameTooShort" }).max(256, { message: "nameTooLong" }),
    email: z.string().email({ message: "invalidEmail" }),
    avatar: z.string().url({ message: "invalidUrl" }).optional(),
    password: z.string().min(6, { message: "minmaxPassword" }).max(100, { message: "minmaxPassword" }),
    confirmPassword: z.string().min(6, { message: "minmaxPassword" }).max(100, { message: "minmaxPassword" }),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "passwordNotMatch",
        path: ["confirmPassword"],
      });
    }
  });

export type CreateEmployeeAccountBodyType = z.TypeOf<typeof CreateEmployeeAccountBody>;

export const UpdateEmployeeAccountBody = z
  .object({
    name: z.string().trim().min(2, { message: "nameTooShort" }).max(256, { message: "nameTooLong" }),
    email: z.string().email({ message: "invalidEmail" }),
    avatar: z.string().url({ message: "invalidUrl" }).optional(),
    changePassword: z.boolean().optional(),
    password: z
      .string()
      .min(6, { message: "minmaxPassword" })
      .max(100, { message: "minmaxPassword" })
      .optional(),
    confirmPassword: z
      .string()
      .min(6, { message: "minmaxPassword" })
      .max(100, { message: "minmaxPassword" })
      .optional(),
    role: z.enum([Role.Owner, Role.Employee]).default(Role.Employee).optional(),
  })
  .strict()
  .superRefine(({ confirmPassword, password, changePassword }, ctx) => {
    if (changePassword) {
      if (!password || !confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "changePasswordRequired",
          path: ["changePassword"],
        });
      } else if (confirmPassword !== password) {
        ctx.addIssue({
          code: "custom",
          message: "passwordNotMatch",
          path: ["confirmPassword"],
        });
      }
    }
  });

export type UpdateEmployeeAccountBodyType = z.TypeOf<typeof UpdateEmployeeAccountBody>;

export const UpdateMeBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    avatar: z.string().url().optional(),
  })
  .strict();

export type UpdateMeBodyType = z.TypeOf<typeof UpdateMeBody>;

export const ChangePasswordBody = z
  .object({
    oldPassword: z.string().min(6, { message: "minmaxPassword" }).max(100, { message: "minmaxPassword" }),
    password: z.string().min(6, { message: "minmaxPassword" }).max(100, { message: "minmaxPassword" }),
    confirmPassword: z.string().min(6, { message: "minmaxPassword" }).max(100, { message: "minmaxPassword" }),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "passwordNotMatch",
        path: ["confirmPassword"],
      });
    }
  });

export type ChangePasswordBodyType = z.TypeOf<typeof ChangePasswordBody>;

export const ChangePasswordV2Body = ChangePasswordBody;

export type ChangePasswordV2BodyType = z.TypeOf<typeof ChangePasswordV2Body>;

export const ChangePasswordV2Res = LoginRes;

export type ChangePasswordV2ResType = z.TypeOf<typeof ChangePasswordV2Res>;

export const AccountIdParam = z.object({
  id: z.coerce.number(),
});

export type AccountIdParamType = z.TypeOf<typeof AccountIdParam>;

export const GetListGuestsRes = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      tableNumber: z.number().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  ),
  message: z.string(),
});

export type GetListGuestsResType = z.TypeOf<typeof GetListGuestsRes>;

export const GetGuestListQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type GetGuestListQueryParamsType = z.TypeOf<typeof GetGuestListQueryParams>;

export const CreateGuestBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    tableNumber: z.number(),
  })
  .strict();

export type CreateGuestBodyType = z.TypeOf<typeof CreateGuestBody>;

export const CreateGuestRes = z.object({
  message: z.string(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    role: z.enum([Role.Guest]),
    tableNumber: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

export type CreateGuestResType = z.TypeOf<typeof CreateGuestRes>;
