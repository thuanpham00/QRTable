import { IngredientListResType } from "@/schemaValidations/ingredient.schema";
import {
  CreateSupplierIngredientBodyType,
  SupplierIngredientListResType,
  SupplierIngredientResType,
  UpdateSupplierIngredientBodyType,
} from "@/schemaValidations/supplierIngredient.schema";
import http from "@/utils/http";

export const supplyApiRequests = {
  listBySupplier: (idSupplier: number) => {
    return http.get<SupplierIngredientListResType>(`/supplies/list/${idSupplier}`);
  },
  notLinkSupplier: (idSupplier: number) => {
    return http.get<IngredientListResType>(`/supplies/not-linked/${idSupplier}`);
  },
  addSupply: (body: CreateSupplierIngredientBodyType) => {
    return http.post<SupplierIngredientResType>("/supplies", body);
  },
  updateSupply: (id: number, body: UpdateSupplierIngredientBodyType) => {
    return http.put<SupplierIngredientResType>(`/supplies/${id}`, body);
  },
  deleteSupply: (id: number) => {
    return http.delete<SupplierIngredientResType>(`/supplies/${id}`);
  },
  getSupplyById: (id: number) => {
    return http.get<SupplierIngredientResType>(`/supplies/${id}`);
  },
};
