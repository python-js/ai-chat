import { apiHandler } from "@/server/http";
import { requireUser } from "@/server/auth";
import { streamChat } from "@/server/services/chat.service";

// 对话接口：鉴权 → 交由 chat.service 编排（校验/持久化/检索/流式）
// useChat 会把会话 id 作为 body.id 发送（HttpChatTransport 默认行为）
export const POST = apiHandler(async (req) => {
  const user = await requireUser();
  const body = await req.json();
  return streamChat({
    userId: user.id,
    chatId: body.id,
    messages: body.messages,
  });
});
