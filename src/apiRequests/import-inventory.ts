import {
  CreateImportReceiptBodyType,
  GetImportReceiptDetailResType,
  GetImportReceiptListResType,
  ImportReceiptQueryType,
  UpdateImportReceiptBodyType,
} from "@/schemaValidations/import-receipt.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const importInventoryApiRequests = {
  listImportInventory: (params: ImportReceiptQueryType) => {
    return http.get<GetImportReceiptListResType>(`/import-receipts?` + queryString.stringify(params));
  },
  getImportInventoryById: (id: number) => {
    return http.get<GetImportReceiptDetailResType>(`/import-receipts/${id}`);
  },
  createImportInventory: (body: CreateImportReceiptBodyType) => {
    return http.post<GetImportReceiptDetailResType>(`/import-receipts`, body);
  },
  updateImportInventory: (id: number, body: UpdateImportReceiptBodyType) => {
    return http.put<GetImportReceiptDetailResType>(`/import-receipts/${id}`, body);
  },
};
