import { prisma } from "@/lib/prisma";
import ChatClient from "./chat-client";
import type { UIMessage } from "ai";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  // 打开历史会话时，从数据库加载消息作为初始内容
  let initialMessages: UIMessage[] = [];
  if (id) {
    const msgs = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, content: true },
    });
    initialMessages = msgs.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content }],
    }));
  }

  // key 保证切换会话时组件重挂载，重置 useChat 状态
  return <ChatClient key={id ?? "new"} chatId={id} initialMessages={initialMessages} />;
}
