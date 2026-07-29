"use client";

import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";
import AiAvatar from "./ai-avatar";

// 从消息 parts 中提取纯文本
function extractText(message: UIMessage): string {
  return (
    message.parts?.filter((p): p is { type: "text"; text: string } => p.type === "text").map((p) => p.text).join("") || ""
  );
}

// 单条消息：用户右对齐紫色气泡，助手左对齐 Markdown 卡片
export default function MessageItem({ message }: { message: UIMessage }) {
  const text = extractText(message);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm text-white shadow-sm">
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <AiAvatar />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-gray-100 bg-white px-5 py-4 shadow-sm">
        <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-violet-600 prose-code:before:content-none prose-code:after:content-none prose-a:text-blue-600 prose-strong:text-gray-800">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
