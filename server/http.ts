import { NextResponse } from "next/server";

// 携带 HTTP 状态码的业务错误，配合 apiHandler 统一转换为 JSON 响应
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

type RouteHandler = (req: Request) => Promise<Response> | Response;

// 统一包装 API route：
// - HttpError → 对应状态码的 JSON 错误响应
// - 其他异常 → 记录日志并返回 500
// route 内部因此无需重复写 try/catch 与错误响应样板
export function apiHandler(handler: RouteHandler): RouteHandler {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("[api] 未处理错误:", err);
      return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
    }
  };
}
