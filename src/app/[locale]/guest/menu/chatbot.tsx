/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User } from "lucide-react";
import { handleErrorApi } from "@/lib/utils";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetChatMessages, useSendMessage } from "@/queries/useChatbot";
import {
  ChatBodyType,
  ChatbotFormSchema,
  ChatbotFormType,
  ChatStorySchemaType,
} from "@/schemaValidations/chatbot.schema";

type Role = "user" | "assistant";

interface Message {
  id: number;
  sessionId: string;
  guestId: number;
  userAsk: {
    role: Role;
    content: string;
    createdAt: string;
  };
  assistantResponse: {
    role: Role;
    content: string;
    intent: string;
    extractedData: string | null;
    suggestedDishes: string;
    responseTimeMs: number;
    aiTokensUsed: number;
    createdAt: string;
  };
}

// cấu trúc dữ liệu từ json server trả về
/**
 * {
                "id": 14,
                "sessionId": "98",
                "guestId": 346,
                "message": "giới thiệu cho tôi các món chay ở đây",
                "response": "Chào bạn! Dựa trên sở thích ăn chay và thuần chay của bạn, cũng như để đảm bảo không có dị ứng với hải sản hay đậu phộng, nhà hàng chúng tôi có 2 món rất phù hợp để giới thiệu cho bạn đây ạ:\n\n1.  **Khoai tây chiên** 🍟: Món khai vị giòn rụm, vừa là món chay vừa là món thuần chay (vegan), đảm bảo an toàn và ngon miệng cho bạn.\n2.  **Rau Câu Dừa 2** 🥥: Một món tráng miệng thanh mát, béo nhẹ vị dừa, cũng là món chay và thuần chay hoàn hảo cho bạn sau bữa ăn.\n\nCả hai món này đều hoàn toàn phù hợp với chế độ ăn thuần chay của bạn và không chứa bất kỳ thành phần nào gây dị ứng cho bạn. Bạn có thể gọi Khoai tây chiên làm món khai vị và kết thúc bằng Rau Câu Dừa 2 mát lạnh nhé! ✨",
                "intent": "search_dish",
                "extractedData": null,
                "suggestedDishes": "[2,3]",
                "responseTimeMs": 7439,
                "aiTokensUsed": 681,
                "createdAt": "2026-03-07T08:52:07.949Z"
            }
 */

//  biến 1 câu trả lời thế này thành 1 cặp 2 object riêng biệt: 1 object (user): message, 1 object (assistant): response, rồi push lần lượt vào mảng messages để hiển thị lên giao diện
// const a = {
//   id: 14,
//   sessionId: "98",
//   guestId: 346,
//   userAsk: {
//     role: "user",
//     content: "giới thiệu cho tôi các món chay ở đây",
//     createdAt: "2026-03-07T08:52:07.949Z",
//   },
//   assistantResponse: {
//     role: "assistant",
//     content:
//       "Chào bạn! Dựa trên sở thích ăn chay và thuần chay của bạn, cũng như để đảm bảo không có dị ứng với hải sản hay đậu phộng, nhà hàng chúng tôi có 2 món rất phù hợp để giới thiệu cho bạn đây ạ:\n\n1.  **Khoai tây chiên** 🍟: Món khai vị giòn rụm, vừa là món chay vừa là món thuần chay (vegan), đảm bảo an toàn và ngon miệng cho bạn.\n2.  **Rau Câu Dừa 2** 🥥: Một món tráng miệng thanh mát, béo nhẹ vị dừa, cũng là món chay và thuần chay hoàn hảo cho bạn sau bữa ăn.\n\nCả hai món này đều hoàn toàn phù hợp với chế độ ăn thuần chay của bạn và không chứa bất kỳ thành phần nào gây dị ứng cho bạn. Bạn có thể gọi Khoai tây chiên làm món khai vị và kết thúc bằng Rau Câu Dừa 2 mát lạnh nhé! ✨",
//     intent: "search_dish",
//     extractedData: null,
//     suggestedDishes: "[2,3]",
//     responseTimeMs: 7439,
//     aiTokensUsed: 681,
//     createdAt: "2026-03-07T08:52:07.949Z" + "thêm ít thời gian (30s)",
//   },
// };

function formatTime(value: string | Date) {
  const d = new Date(value);
  const utc7 = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return `${String(utc7.getUTCHours()).padStart(2, "0")}:${String(utc7.getUTCMinutes()).padStart(2, "0")}`;
}

function addSeconds(value: string | Date, seconds: number) {
  const date = new Date(value);
  date.setSeconds(date.getSeconds() + seconds);
  return formatTime(date.toISOString());
}

export default function Chatbot({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}) {
  const getChatMessages = useGetChatMessages(showModal);
  const guestId = getChatMessages?.data?.payload.data?.guestSession.id;
  const sessionId = getChatMessages?.data?.payload.data?.guestSession.tableSessionId;

  const sendMessageToChatbot = useSendMessage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (getChatMessages.data) {
      const historyMessages = getChatMessages.data.payload.data.messages.map((msg: ChatStorySchemaType) => {
        const userMsg = {
          role: "user" as Role,
          content: msg.message,
          createdAt: formatTime(msg.createdAt), // '2026-03-07T08:52:07.949Z'
        };
        const assistantResponse = {
          role: "assistant" as Role,
          content: msg.response,
          intent: msg.intent || "",
          extractedData: msg.extractedData ?? null,
          suggestedDishes: msg.suggestedDishes || "",
          responseTimeMs: msg.responseTimeMs || 0,
          aiTokensUsed: msg.aiTokensUsed || 0,
          createdAt: addSeconds(msg.createdAt, 30),
        };
        return {
          id: msg.id,
          sessionId: msg.sessionId,
          guestId: msg.guestId as number,
          userAsk: userMsg,
          assistantResponse: assistantResponse,
        };
      });
      setMessages(historyMessages);
    }
  }, [getChatMessages.data]);

  const form = useForm<ChatbotFormType>({
    resolver: zodResolver(ChatbotFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const submit = async (values: ChatbotFormType) => {
    try {
      const body: ChatBodyType = {
        content: values.content,
        guestId: guestId as number, // Thay bằng guestId thực tế
        sessionId: String(sessionId), // Thay bằng sessionId thực tế
      };
      setIsTyping(true);

      form.reset();
      const res = await sendMessageToChatbot.mutateAsync(body);
      if (res) {
        setIsTyping(false);
        getChatMessages.refetch(); // Sau khi gửi thành công, gọi lại API để lấy toàn bộ lịch sử chat mới nhất (bao gồm cả câu vừa gửi và câu trả lời mới)
      }
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
      setIsTyping(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent
        className="sm:max-w-105 p-0 gap-0 overflow-hidden flex flex-col h-150"
        closeButtonClassName="top-3 right-3 opacity-100 rounded-full bg-red-500 hover:bg-red-400 text-white p-1 [&_svg:not([class*='size-'])]:size-5"
      >
        <DialogHeader className="px-4 py-3 border-b bg-primary text-primary-foreground shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-9 w-9 bg-primary-foreground/20">
                <AvatarFallback>
                  <Bot className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-primary" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-sm font-semibold text-primary-foreground">Trợ lý AI</DialogTitle>
              <p className="text-xs text-primary-foreground/70">Luôn sẵn sàng hỗ trợ bạn</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* User bubble */}
                {msg.userAsk.content !== "" && (
                  <div key={`user-${msg.id}`} className="flex items-end gap-2 flex-row-reverse">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-xs bg-muted">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 max-w-[75%] items-end">
                      <div className="rounded-2xl rounded-br-none px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground">
                        {msg.userAsk.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">{msg.userAsk.createdAt}</span>
                    </div>
                  </div>
                )}

                {/* Assistant bubble */}
                <div key={`assistant-${msg.id + 1}`} className="flex items-end gap-2 flex-row">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 max-w-[75%] items-start">
                    <div className="rounded-2xl rounded-bl-none px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap bg-muted">
                      {msg.assistantResponse.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">
                      {msg.assistantResponse.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t shrink-0">
          <Form {...form}>
            <form
              className="space-y-2 shrink-0 w-full"
              noValidate
              onSubmit={form.handleSubmit(submit, (err) => {
                console.log(err);
              })}
            >
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <Input
                          placeholder="Nhập câu hỏi..."
                          type="text"
                          autoComplete="off"
                          disabled={isTyping}
                          {...field}
                        />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0"
                  disabled={isTyping || !form.watch("content").trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
