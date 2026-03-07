import z from "zod";

// Schema chỉ dùng cho form (không validate guestId, sessionId vì đó là data backend)
export const ChatbotFormSchema = z.object({
  content: z.string().min(1, "Vui lòng nhập câu hỏi"),
});

export type ChatbotFormType = z.TypeOf<typeof ChatbotFormSchema>;

// Chat request body
export const ChatBody = z
  .object({
    content: z.string().min(1).max(1000),
    guestId: z.number(),
    sessionId: z.string(),
  })
  .strict();

export type ChatBodyType = z.TypeOf<typeof ChatBody>;

// Dish schema for response
const DishSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
  image: z.string().nullable(),
  status: z.string(),
  spicyLevel: z.number().nullable(),
  dietaryTags: z.string().nullable(),
  preparationTime: z.number().nullable(),
  popularity: z.number().nullable(),
});

// Chat response
export const ChatRes = z.object({
  data: z.object({
    response: z.string(),
    suggestedDishes: z.array(DishSchema),
    intent: z.string().optional(),
  }),
  message: z.string(),
});

export type ChatResType = z.TypeOf<typeof ChatRes>;

// Chat History Schema (lịch sử chat của guest)
export const ChatStorySchema = z.object({
  id: z.number(),
  sessionId: z.string(),
  guestId: z.number().nullable(),
  message: z.string(),
  response: z.string(),
  intent: z.string().nullable(),
  extractedData: z.string().nullable(),
  suggestedDishes: z.string().nullable(),
  responseTimeMs: z.number().nullable(),
  aiTokensUsed: z.number().nullable(),
  createdAt: z.date(),
});

export type ChatStorySchemaType = z.TypeOf<typeof ChatStorySchema>;

// Response cho danh sách chat history
export const ChatStoryListRes = z.object({
  data: z.object({
    guestSession: z.object({
      id: z.number(),
      tableSessionId: z.number(),
    }),
    messages: z.array(ChatStorySchema),
  }),
  message: z.string(),
});

export type ChatStoryListResType = z.TypeOf<typeof ChatStoryListRes>;
