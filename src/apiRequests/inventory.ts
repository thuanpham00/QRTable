import {
  CreateInventoryStockBodyType,
  InventoryStockListResType,
  InventoryStockQueryType,
  InventoryStockResType,
  UpdateInventoryStockBodyType,
} from "@/schemaValidations/inventory-stock.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const inventoryApiRequests = {
  list: (params: InventoryStockQueryType) => {
    return http.get<InventoryStockListResType>("/inventory-stocks?" + queryString.stringify(params));
  },
  addIngredient: (body: CreateInventoryStockBodyType) => {
    return http.post<InventoryStockResType>("/inventory-stocks", body);
  },
  updateIngredient: (id: number, body: UpdateInventoryStockBodyType) => {
    return http.put<InventoryStockResType>(`/inventory-stocks/${id}`, body);
  },
  deleteIngredient: (id: number) => {
    return http.delete<InventoryStockResType>(`/inventory-stocks/${id}`);
  },
  getIngredientById: (id: number) => {
    return http.get<InventoryStockResType>(`/inventory-stocks/${id}`);
  },
};
