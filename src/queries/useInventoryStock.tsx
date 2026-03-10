import { inventoryApiRequests } from "@/apiRequests/inventory";
import {
  CreateInventoryStockBodyType,
  InventoryStockQueryType,
  UpdateInventoryStockBodyType,
} from "@/schemaValidations/inventory-stock.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListInventoryStockQuery = (params: InventoryStockQueryType) => {
  return useQuery({
    queryKey: ["inventory-stocks", params],
    queryFn: () => {
      return inventoryApiRequests.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetInventoryStockDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["inventory-stock-detail", id],
    queryFn: () => {
      return inventoryApiRequests.getIngredientById(id);
    },
    enabled,
  });
};

export const useAddInventoryStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInventoryStockBodyType) => {
      return inventoryApiRequests.addIngredient(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stocks"] });
    },
  });
};

export const useUpdateInventoryStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateInventoryStockBodyType }) => {
      return inventoryApiRequests.updateIngredient(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stocks"] });
    },
  });
};

export const useDeleteInventoryStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return inventoryApiRequests.deleteIngredient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stocks"] });
    },
  });
};
