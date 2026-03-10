import { supplyApiRequests } from "@/apiRequests/supply";
import {
  CreateSupplierIngredientBodyType,
  UpdateSupplierIngredientBodyType,
} from "@/schemaValidations/supplierIngredient.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListSupplyBySupplierQuery = ({
  supplierId,
  enabled,
}: {
  supplierId: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["supplies", supplierId],
    queryFn: () => {
      return supplyApiRequests.listBySupplier(supplierId);
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetListNotLinkedSupplier = ({
  supplierId,
  enabled,
}: {
  supplierId: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["not-linked-supplier", supplierId],
    queryFn: () => {
      return supplyApiRequests.notLinkSupplier(supplierId);
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetSupplyDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["supply-detail", id],
    queryFn: () => {
      return supplyApiRequests.getSupplyById(id);
    },
    enabled,
  });
};

export const useAddSupplyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSupplierIngredientBodyType) => {
      return supplyApiRequests.addSupply(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
    },
  });
};

export const useUpdateSupplyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateSupplierIngredientBodyType }) => {
      return supplyApiRequests.updateSupply(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
    },
  });
};

export const useDeleteSupplyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return supplyApiRequests.deleteSupply(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
    },
  });
};
