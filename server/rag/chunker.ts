import { config } from "@/lib/config";

// 将文本按固定大小分块（相邻块带重叠），保证跨块语义连续
export function chunkText(
  text: string,
  size = config.rag.chunkSize,
  overlap = config.rag.chunkOverlap,
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    start += size - overlap;
  }
  return chunks;
}
