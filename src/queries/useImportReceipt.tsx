import { importInventoryApiRequests } from "@/apiRequests/import-inventory";
import {
  CreateImportReceiptBodyType,
  ImportReceiptQueryType,
  UpdateImportReceiptBodyType,
} from "@/schemaValidations/import-receipt.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListImportReceiptQuery = (params: ImportReceiptQueryType) => {
  return useQuery({
    queryKey: ["import-receipts", params],
    queryFn: () => {
      return importInventoryApiRequests.listImportInventory(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetImportReceiptDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["import-receipt-detail", id],
    queryFn: () => {
      return importInventoryApiRequests.getImportInventoryById(id);
    },
    enabled,
  });
};

export const useAddImportReceiptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateImportReceiptBodyType) => {
      return importInventoryApiRequests.createImportInventory(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["import-receipts"] });
    },
  });
};

export const useUpdateImportReceiptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateImportReceiptBodyType }) => {
      return importInventoryApiRequests.updateImportInventory(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["import-receipts"] });
    },
  });
};
