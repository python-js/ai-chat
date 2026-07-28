// 业务可调参数集中管理，避免魔法值散落在各处
// 修改分块策略、检索数量、标题长度等，只需改这里
export const config = {
  rag: {
    /** 单个知识块的字符数 */
    chunkSize: 800,
    /** 相邻块重叠字符数，保证语义连续 */
    chunkOverlap: 100,
    /** 相似度检索返回的 top-k 数量 */
    topK: 5,
  },
  conversation: {
    /** 会话标题截取首条提问的最大字符数 */
    titleMaxLength: 20,
  },
} as const;
