import { NextResponse } from "next/server";
import { extractPdfText } from "@/lib/pdf";
import { apiHandler, HttpError } from "@/server/http";
import { requireUser } from "@/server/auth";
import { createDocument, listDocuments } from "@/server/services/document.service";

// 上传文档：解析文件内容 → 交由 document.service 建记录并异步 embedding
export const POST = apiHandler(async (req) => {
  await requireUser();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) throw new HttpError(400, "未选择文件");

  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf");
  const isMd = name.endsWith(".md") || name.endsWith(".markdown");
  if (!isPdf && !isMd) throw new HttpError(400, "仅支持 PDF 和 Markdown 文件");

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = isPdf ? await extractPdfText(buffer) : buffer.toString("utf-8");
  if (!text.trim()) throw new HttpError(400, "文件内容为空");

  const doc = await createDocument(file.name, isPdf ? "pdf" : "markdown", text);
  return NextResponse.json({ id: doc.id, filename: doc.filename, status: doc.status });
});

// 文档列表
export const GET = apiHandler(async () => {
  await requireUser();
  return NextResponse.json(await listDocuments());
});
