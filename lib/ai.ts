import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { env } from "./env";

// 百炼 DashScope（OpenAI 兼容模式），配置统一来自校验后的 env
const dashscope = createOpenAICompatible({
  name: "dashscope",
  baseURL: env.DASHSCOPE_BASE_URL,
  apiKey: env.DASHSCOPE_API_KEY,
});

// LLM 对话模型
export const llm = dashscope(env.LLM_MODEL);

// Embedding 模型
export const embeddingModel = dashscope.textEmbeddingModel(env.EMBEDDING_MODEL);
