import { inventoryStockApiRequests } from "@/apiRequests/inventory";
import {
  InventoryStockQueryType,
  UpdateInventoryStockBodyType,
} from "@/schemaValidations/inventory-stock.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListInventoryStockQuery = (params: InventoryStockQueryType) => {
  return useQuery({
    queryKey: ["inventory-stocks", params],
    queryFn: () => {
      return inventoryStockApiRequests.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetListInventoryStockNoPaginationQuery = ({ key, enabled }: { key: string; enabled: boolean }) => {
  return useQuery({
    queryKey: [key],
    queryFn: () => {
      return inventoryStockApiRequests.listNoPagination();
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
    enabled: enabled,
  });
};

export const useGetInventoryStockDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["inventory-stock-detail", id],
    queryFn: () => {
      return inventoryStockApiRequests.getInventoryStockById(id);
    },
    enabled,
  });
};

export const useUpdateInventoryStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateInventoryStockBodyType }) => {
      return inventoryStockApiRequests.updateInventoryStock(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stocks"] });
    },
  });
};
