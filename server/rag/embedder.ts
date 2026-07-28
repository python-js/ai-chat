import { embedMany } from "ai";
import { embeddingModel } from "@/lib/ai";

// 批量生成 embedding 向量
export async function embedTexts(values: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model: embeddingModel, values });
  return embeddings;
}

// 将 embedding 数组转为 pgvector 字面量字符串（如 "[0.1,0.2,...]"）
export function toVectorStr(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
