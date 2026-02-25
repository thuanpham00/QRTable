import {
  CleanTableResType,
  CreateTableBodyType,
  TableListResType,
  TableQueryType,
  TableResType,
  UpdateTableBodyType,
} from "@/schemaValidations/table.schema";
import { TableSessionListResType } from "@/schemaValidations/tableSessions.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const tableApiRequests = {
  list: (params: TableQueryType) => {
    return http.get<TableListResType>("/tables?" + queryString.stringify(params));
  },
  addTable: (body: CreateTableBodyType) => {
    return http.post<TableResType>("/tables", body);
  },
  updateTable: (id: number, body: UpdateTableBodyType) => {
    return http.put<TableResType>(`/tables/${id}`, body);
  },
  deleteTable: (id: number) => {
    return http.delete<TableResType>(`/tables/${id}`);
  },
  getTableById: (id: number) => {
    return http.get<TableResType>(`/tables/${id}`);
  },
  getListTableSessionHistory: (tableNumber: number) =>
    http.get<TableSessionListResType>("/tables/" + tableNumber + "/sessions"),

  cleanTable: (tableNumber: number) => {
    return http.post<CleanTableResType>(`/tables/clean`, { tableNumber });
  },
};
