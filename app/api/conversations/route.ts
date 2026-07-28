import { NextResponse } from "next/server";
import { apiHandler } from "@/server/http";
import { requireUser } from "@/server/auth";
import { listConversations } from "@/server/services/conversation.service";

// 当前用户的会话列表（按最近更新倒序）
export const GET = apiHandler(async () => {
  const user = await requireUser();
  return NextResponse.json(await listConversations(user.id));
});
