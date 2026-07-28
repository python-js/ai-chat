import { PDFParse } from "pdf-parse";
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

// 服务端必须指定 worker 路径（Windows 需要 file:// URL）
// worker 配置收口于此，避免散落在 route 顶层造成隐式副作用
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  `file:///${process.cwd().replace(/\\/g, "/")}/node_modules/`
).href;

// 从 PDF buffer 提取纯文本
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    // 无论成功失败都释放解析器资源
    await parser.destroy();
  }
}
