import { ChatBodyType, ChatStoryListResType } from "@/schemaValidations/chatbot.schema";
import http from "@/utils/http";

export const ChatbotApiRequests = {
  sendMessage: async (body: ChatBodyType) => {
    return http.post("/gemini/chat", body);
  },

  messages: () => {
    return http.get<ChatStoryListResType>("/gemini/messages");
  },
};
