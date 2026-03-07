import { ChatbotApiRequests } from "@/apiRequests/chatbot";
import { ChatBodyType } from "@/schemaValidations/chatbot.schema";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export const useGetChatMessages = (showModal: boolean) => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: () => {
      return ChatbotApiRequests.messages();
    },
    enabled: showModal, // Chỉ chạy query khi showModal là true
    staleTime: 5 * 60 * 1000, // Dữ liệu sẽ được coi là mới trong 5 phút
    placeholderData: keepPreviousData,
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: (body: ChatBodyType) => {
      return ChatbotApiRequests.sendMessage(body);
    },
  });
};
