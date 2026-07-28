import { prisma } from "@/lib/prisma";
import { chunkText } from "@/server/rag/chunker";
import { embedTexts, toVectorStr } from "@/server/rag/embedder";
import type { DocumentDto } from "@/types/api";

// 文档入库编排：分块 → 批量 embedding → 写入向量库 → 更新状态为 ready
export async function processDocument(documentId: string, text: string) {
  const chunks = chunkText(text);
  const embeddings = await embedTexts(chunks);

  // pgvector 无 Prisma 原生支持，用 raw SQL 插入向量
  for (let i = 0; i < chunks.length; i++) {
    const vectorStr = toVectorStr(embeddings[i]);
    await prisma.$executeRaw`
      INSERT INTO "DocumentChunk" (id, "documentId", content, embedding, "createdAt")
      VALUES (${crypto.randomUUID()}, ${documentId}, ${chunks[i]}, ${vectorStr}::vector, NOW())
    `;
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "ready" },
  });
}

// 创建文档记录并异步触发 embedding（不阻塞响应）
// 已知局限：fire-and-forget，进程重启会丢失处理中的任务（后续可引入任务队列）
export async function createDocument(
  filename: string,
  fileType: "pdf" | "markdown",
  text: string,
) {
  const doc = await prisma.document.create({
    data: { filename, fileType, content: text, status: "processing" },
  });

  processDocument(doc.id, text).catch(async (err) => {
    console.error("Embedding 处理失败:", err);
    await prisma.document.update({
      where: { id: doc.id },
      data: { status: "error" },
    });
  });

  return doc;
}

// 文档列表
export function listDocuments(): Promise<DocumentDto[]> {
  return prisma.document.findMany({
    select: { id: true, filename: true, fileType: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}
