import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

// 前端按线上格式消费：日期字段经 JSON 序列化后为字符串
export interface Doc {
  id: string;
  filename: string;
  fileType: string;
  status: string;
  createdAt: string;
}

// 共享缓存 key：上传成功后通过全局 mutate 此 key 触发文档列表刷新
export const DOCUMENTS_KEY = "/api/documents";

export function useDocuments() {
  return useSWR<Doc[]>(DOCUMENTS_KEY, fetcher);
}
