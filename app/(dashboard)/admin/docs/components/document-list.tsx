"use client";

import { Badge, Card, CardContent } from "@/components/ui";
import { useDocuments } from "@/hooks/use-documents";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "等待中", variant: "outline" },
  processing: { label: "处理中", variant: "secondary" },
  ready: { label: "就绪", variant: "default" },
  error: { label: "失败", variant: "destructive" },
};

// 文档列表：SWR 驱动，展示已上传文档及处理状态
export default function DocumentList() {
  const { data: docs = [] } = useDocuments();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">已上传文档</h2>
        <span className="text-xs text-gray-400">{docs.length} 份</span>
      </div>

      {docs.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-gray-400">
            暂无文档，上传后即可使用
          </CardContent>
        </Card>
      )}

      {docs.map((doc) => {
        const cfg = statusConfig[doc.status] || { label: doc.status, variant: "outline" as const };
        return (
          <Card key={doc.id} className="transition-shadow hover:shadow-sm">
            <CardContent className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                  {doc.fileType === "pdf" ? (
                    <svg className="h-4.5 w-4.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  ) : (
                    <svg className="h-4.5 w-4.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.filename}</p>
                  <p className="text-xs text-gray-400">
                    {doc.fileType.toUpperCase()} · {new Date(doc.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
              <Badge variant={cfg.variant} className="text-xs">
                {cfg.label}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
