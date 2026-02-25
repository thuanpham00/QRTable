import {
  TableSessionActiveListResType,
  TableSessionActiveResType,
  TableSessionDetailResType,
} from "@/schemaValidations/tableSessions.schema";
import http from "@/utils/http";

const tableSessionApiRequest = {
  getDetailTableSessionHistory: (idTableSession: number) =>
    http.get<TableSessionDetailResType>("/table-sessions/" + idTableSession),

  getListTableSessionActive: () => http.get<TableSessionActiveListResType>("/table-sessions/active-list"),

  getTableSessionActive: (tableNumber: number) =>
    http.get<TableSessionActiveResType>("/table-sessions/" + tableNumber + "/active"),
};

export default tableSessionApiRequest;
