import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { llm } from "@/lib/ai";
import { HttpError } from "@/server/http";
import { searchSimilar } from "@/server/rag/retriever";
import { buildChatPrompt } from "@/server/rag/prompt";
import { touchConversation, saveMessage } from "./conversation.service";

// 从 UIMessage 的 parts 中提取纯文本
function extractText(message: UIMessage): string {
  if (!message.parts) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

interface StreamChatParams {
  userId: string;
  chatId?: string;
  messages: UIMessage[];
}

// 对话编排：校验 → 持久化用户消息 → RAG 检索 → 流式生成 → 持久化 AI 回复
export async function streamChat({ userId, chatId, messages }: StreamChatParams) {
  if (!messages?.length) throw new HttpError(400, "消息为空");
  const queryText = extractText(messages[messages.length - 1]);
  if (!queryText) throw new HttpError(400, "消息内容为空");

  // 持久化会话与用户消息（touchConversation 内含归属校验）
  if (chatId) {
    await touchConversation(chatId, userId, queryText);
    await saveMessage(chatId, "user", queryText);
  }

  // RAG 检索并组装上下文
  const chunks = await searchSimilar(queryText);
  const context =
    chunks.length > 0 ? chunks.join("\n\n---\n\n") : "（未找到相关文档内容）";

  const result = streamText({
    model: llm,
    system: buildChatPrompt(context),
    messages: await convertToModelMessages(messages),
    // MySQL 扩展点：未来接入 Tool Calling 时，在此通过 tools 参数注入
    // MySQL 查询工具（见 server/rag 同级规划），无需改动本编排主流程
    onFinish: async ({ text }) => {
      if (chatId && text) {
        await saveMessage(chatId, "assistant", text);
      }
    },
  });

  return result.toTextStreamResponse();
}
