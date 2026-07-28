import { auth } from "@/auth";
import { HttpError } from "./http";

// 统一鉴权：未登录直接抛 401，route 无需重复写 session 判断样板
// 返回值即当前登录用户（含 id），供业务层直接使用
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new HttpError(401, "未登录");
  }
  return session.user;
}
