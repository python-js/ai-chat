import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { embedTexts, toVectorStr } from "./embedder";

// 相似度检索 top-k，返回最相关的知识块内容
export async function searchSimilar(
  query: string,
  topK = config.rag.topK,
): Promise<string[]> {
  const [embedding] = await embedTexts([query]);
  const vectorStr = toVectorStr(embedding);

  const results = await prisma.$queryRaw<{ content: string }[]>`
    SELECT content FROM "DocumentChunk"
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${topK}
  `;

  return results.map((r) => r.content);
}
