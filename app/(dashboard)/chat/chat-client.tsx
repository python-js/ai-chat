"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, type UIMessage } from "ai";
import { useSWRConfig } from "swr";
import { CONVERSATIONS_KEY } from "@/hooks/use-conversations";
import MessageList from "./components/message-list";
import ChatInput from "./components/chat-input";

interface ChatClientProps {
  chatId?: string;
  initialMessages?: UIMessage[];
}

// 容器：编排 useChat 状态 + 子件渲染，不含 UI 细节
export default function ChatClient({ chatId, initialMessages }: ChatClientProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const notifiedRef = useRef(false);
  const { mutate } = useSWRConfig();
  // 新会话（无 chatId）时本地生成稳定 id，作为会话主键发给服务端
  const [stableId] = useState(() => chatId ?? crypto.randomUUID());

  const { messages, sendMessage, status } = useChat({
    id: stableId,
    // AI SDK v7 的 ChatInit 用 messages 字段接收初始消息（旧版 initialMessages 已废弃，会被静默忽略）
    messages: initialMessages,
    transport: new TextStreamChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 新会话产生第一条消息后，全局 mutate 刷新侧边栏会话列表（只触发一次）
  useEffect(() => {
    if (!chatId && messages.length > 0 && !notifiedRef.current) {
      notifiedRef.current = true;
      mutate(CONVERSATIONS_KEY);
    }
  }, [messages.length, chatId, mutate]);

  function handleSend(text: string) {
    sendMessage({ text });
  }

  return (
    <>
      <MessageList messages={messages} isLoading={isLoading} bottomRef={bottomRef} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </>
  );
}
