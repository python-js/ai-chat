import { embedMany } from "ai";
import { embeddingModel } from "@/lib/ai";

// DashScope embedding API 单次请求上限 20 条
const BATCH_SIZE = 20;

// 分批生成 embedding 向量
export async function embedTexts(values: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: values.slice(i, i + BATCH_SIZE),
    });
    results.push(...embeddings);
  }
  return results;
}

// 将 embedding 数组转为 pgvector 字面量字符串（如 "[0.1,0.2,...]"）
export function toVectorStr(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
