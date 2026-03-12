import {
  SupplierListResType,
  SupplierQueryType,
  CreateSupplierBodyType,
  UpdateSupplierBodyType,
  SupplierResType,
  SupplierOptionsResType,
} from "@/schemaValidations/supplier.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const supplierApiRequests = {
  list: (params: SupplierQueryType) => {
    return http.get<SupplierListResType>("/suppliers?" + queryString.stringify(params));
  },
  addSupplier: (body: CreateSupplierBodyType) => {
    return http.post<SupplierResType>("/suppliers", body);
  },
  updateSupplier: (id: number, body: UpdateSupplierBodyType) => {
    return http.put<SupplierResType>(`/suppliers/${id}`, body);
  },
  deleteSupplier: (id: number) => {
    return http.delete<SupplierResType>(`/suppliers/${id}`);
  },
  getSupplierById: (id: number) => {
    return http.get<SupplierResType>(`/suppliers/${id}`);
  },
  getSupplierOption: () => {
    return http.get<SupplierOptionsResType>(`/suppliers/options`);
  },
};
