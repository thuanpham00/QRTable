import tableSessionApiRequest from "@/apiRequests/table-session";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetDetailTableSessionHistoryQuery = ({
  idTableSession,
  enable,
}: {
  idTableSession: number;
  enable: boolean;
}) => {
  return useQuery({
    queryKey: ["table-session-detail", idTableSession],
    queryFn: () => {
      return tableSessionApiRequest.getDetailTableSessionHistory(idTableSession);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enable,
  });
};

export const useGetActiveTableSessionQuery = ({
  tableNumber,
  enable,
}: {
  tableNumber: number;
  enable: boolean;
}) => {
  return useQuery({
    queryKey: ["table-session-active", tableNumber],
    queryFn: () => {
      return tableSessionApiRequest.getTableSessionActive(tableNumber);
    },
    enabled: enable,
  });
};

export const useGetListActiveTableSessionQuery = () => {
  return useQuery({
    queryKey: ["table-session-active-list"],
    queryFn: () => {
      return tableSessionApiRequest.getListTableSessionActive();
    },
  });
};
