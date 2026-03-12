import { supplierApiRequests } from "@/apiRequests/supplier";
import {
  CreateSupplierBodyType,
  SupplierQueryType,
  UpdateSupplierBodyType,
} from "@/schemaValidations/supplier.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListSupplierQuery = (params: SupplierQueryType) => {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => {
      return supplierApiRequests.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetSupplierDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["supplier-detail", id],
    queryFn: () => {
      return supplierApiRequests.getSupplierById(id);
    },
    enabled,
  });
};

export const useGetSupplierOptionQuery = () => {
  return useQuery({
    queryKey: ["supplier-options"],
    queryFn: () => {
      return supplierApiRequests.getSupplierOption();
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 1 minute
  });
};

export const useAddSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSupplierBodyType) => {
      return supplierApiRequests.addSupplier(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useUpdateSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateSupplierBodyType }) => {
      return supplierApiRequests.updateSupplier(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useDeleteSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return supplierApiRequests.deleteSupplier(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};
