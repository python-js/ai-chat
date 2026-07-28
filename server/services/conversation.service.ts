import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { HttpError } from "@/server/http";
import type { ConversationDto } from "@/types/api";

// 校验会话归属：会话已存在但不属于当前用户 → 拒绝
// 修复点：此前 upsert 不校验归属，可越权写入他人会话
async function assertOwnership(chatId: string, userId: string) {
  const existing = await prisma.conversation.findUnique({ where: { id: chatId } });
  if (existing && existing.userId !== userId) {
    throw new HttpError(403, "无权访问该会话");
  }
}

// 标题截断：取前 N 个字符（纯函数，便于单测）
export function truncateTitle(title: string): string {
  return title.slice(0, config.conversation.titleMaxLength);
}

// 确保会话存在（不存在则以该用户身份创建），并刷新更新时间
export async function touchConversation(chatId: string, userId: string, title: string) {
  await assertOwnership(chatId, userId);
  await prisma.conversation.upsert({
    where: { id: chatId },
    update: { updatedAt: new Date() },
    create: {
      id: chatId,
      userId,
      title: truncateTitle(title),
    },
  });
}

// 保存一条消息（user / assistant 通用）
export function saveMessage(chatId: string, role: "user" | "assistant", content: string) {
  return prisma.message.create({
    data: { conversationId: chatId, role, content },
  });
}

// 当前用户的会话列表（按最近更新倒序）
export function listConversations(userId: string): Promise<ConversationDto[]> {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });
}
