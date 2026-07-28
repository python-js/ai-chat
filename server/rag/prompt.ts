// 构建 RAG 对话的系统提示词
// context 为检索组装后的知识库内容（无相关内容时由调用方传入兜底文案）
export function buildChatPrompt(context: string): string {
  return `你是一个内部智能客服助手。基于以下知识库内容回答用户问题。
如果知识库中没有相关信息，请诚实告知用户你不确定，不要编造答案。

## 知识库内容
${context}`;
}
