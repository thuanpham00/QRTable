"use client";
import useQueryParams from "@/hooks/useQueryParams";
import { useGetListChatMessages } from "@/queries/useChatbot";
import { ChatbotQueryType, ChatStoryAllGuestsListResType } from "@/schemaValidations/chatbot.schema";
import { isUndefined, omitBy } from "lodash";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import AutoPagination from "@/components/auto-pagination";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function ChatbotTable() {
  const t = useTranslations("ManageChatbots");

  const queryParams = useQueryParams();

  const limit = queryParams.limit ? Number(queryParams.limit) : 5;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: ChatbotQueryType = omitBy(
    {
      page,
      limit,
      name: queryParams.name ? queryParams.name : undefined,
    },
    isUndefined,
  ) as ChatbotQueryType;

  const { data: listMessage, refetch } = useGetListChatMessages(queryConfig);
  const messages = (listMessage?.payload.data || []) as ChatStoryAllGuestsListResType["data"];
  const currentPage = listMessage?.payload.pagination.page || 0; // trang hiện tại
  const totalPages = listMessage?.payload.pagination.totalPages || 0; // tổng số trang

  const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);

  // Lấy guest đang chọn
  const selectedGuest = messages.find((g) => g.guestId === selectedGuestId);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="outline" className="bg-red-500! hover:bg-red-600!" onClick={() => refetch()}>
          <RefreshCcw />
        </Button>
      </div>
      <div className="flex gap-6">
        {/* Danh sách guest */}
        <div className="w-80 border rounded-md overflow-y-auto max-h-125">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("guestId")}</TableHead>
                <TableHead>{t("guestName")}</TableHead>
                <TableHead>{t("tableSession")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((guest) => (
                <TableRow
                  key={guest.guestId}
                  onClick={() => setSelectedGuestId(guest.guestId)}
                  className={
                    guest.guestId === selectedGuestId ? "bg-blue-500 cursor-pointer" : "cursor-pointer"
                  }
                >
                  <TableCell>{guest.guestId}</TableCell>
                  <TableCell>{guest.guestName}</TableCell>
                  <TableCell>{guest.tableSessionId ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Lịch sử chat của guest đã chọn */}
        <div className="flex-1 border rounded-md p-4 max-h-125 overflow-y-auto">
          {selectedGuest ? (
            <div>
              <h3 className="font-bold mb-2">Chat history for Guest #{selectedGuest.guestId}</h3>
              <ul className="space-y-2">
                {selectedGuest.messages.map((msg) => (
                  <li key={msg.id} className="border-b pb-2">
                    <div>
                      <b>Q:</b> {msg.message}
                    </div>
                    <div>
                      <b>A:</b> {msg.response}
                    </div>
                    <div className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>Chọn một guest để xem lịch sử chat</div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <AutoPagination
          queryConfig={queryConfig}
          page={currentPage} // trang hiện tại
          totalPages={totalPages} // tổng số trang
          pathname="/manage/chatbots"
        />
      </div>
    </div>
  );
}
