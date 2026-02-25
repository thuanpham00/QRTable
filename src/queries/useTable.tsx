import { tableApiRequests } from "@/apiRequests/table";
import { CreateTableBodyType, TableQueryType, UpdateTableBodyType } from "@/schemaValidations/table.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListTableQuery = (params: TableQueryType) => {
  return useQuery({
    queryKey: ["tables", params],
    queryFn: () => {
      return tableApiRequests.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minutes
  });
};

export const useGetTableDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["table-detail", id],
    queryFn: () => {
      return tableApiRequests.getTableById(id);
    },
    enabled,
  });
};

export const useAddTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTableBodyType) => {
      return tableApiRequests.addTable(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useUpdateTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateTableBodyType }) => {
      return tableApiRequests.updateTable(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useDeleteTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return tableApiRequests.deleteTable(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useGetListTableSessionHistoryQuery = ({
  tableNumber,
  enable,
}: {
  tableNumber: number;
  enable: boolean;
}) => {
  return useQuery({
    queryKey: ["table-session-history", tableNumber],
    queryFn: () => {
      return tableApiRequests.getListTableSessionHistory(tableNumber);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enable,
  });
};

export const useCleaningTableMutation = () => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tableNumber: number) => {
      return tableApiRequests.cleanTable(tableNumber);
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["tables"] });
    // },
  });
};
