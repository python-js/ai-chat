# 智能客服系统

基于 **RAG（检索增强生成）** 的智能客服 Web 应用。用户上传 PDF / Markdown 文档构建知识库，AI 结合知识库内容以流式对话回答问题。

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Next.js 16（App Router / Turbopack）+ React 19 |
| 语言 | TypeScript 5 |
| 数据库 | PostgreSQL + [pgvector](https://github.com/pgvector/pgvector)（向量检索） |
| ORM | Prisma 7（PrismaPg 适配器） |
| AI | Vercel AI SDK v7 + 阿里云百炼（LLM `qwen-plus` / Embedding `text-embedding-v3`，1024 维） |
| 鉴权 | next-auth v5（Credentials） |
| 数据获取 | SWR |
| UI | Tailwind CSS v4 + shadcn/ui |
| 校验 | zod（环境变量启动即校验） |
| 测试 | vitest |
| 包管理 | pnpm（经 corepack 锁定版本） |

## 功能特性

- 流式 AI 对话（Markdown 渲染）
- 多会话管理（历史持久化、侧边栏切换）
- 知识库管理（拖拽上传 PDF / Markdown，异步分块 + 向量化）
- 基于 pgvector 的语义检索（top-K 相似召回）
- 统一鉴权与错误处理

## 项目结构

```
ai-chat/
├── app/
│   ├── (dashboard)/            # 需登录的页面（路由组，layout 统一鉴权）
│   │   ├── chat/               # 对话页（含 components/ 私有子件）
│   │   ├── admin/docs/         # 知识库管理（含 components/ 私有子件）
│   │   ├── admin/config/       # 系统配置
│   │   ├── layout.tsx          # 鉴权守卫 + 侧边栏布局
│   │   ├── sidebar.tsx         # 侧边栏容器
│   │   └── error.tsx           # 错误边界
│   ├── api/                    # API 路由（薄 HTTP 层）
│   │   ├── auth/[...nextauth]/ # 鉴权
│   │   ├── chat/               # 流式对话
│   │   ├── conversations/      # 会话列表
│   │   └── documents/          # 文档上传 / 列表
│   ├── login/                  # 登录页
│   ├── generated/prisma/       # Prisma Client 生成产物（勿手改）
│   └── not-found.tsx           # 全局 404
├── components/
│   ├── sidebar/                # 全局侧边栏子件（会话列表、导航）
│   ├── ui/                     # shadcn/ui 基础组件（barrel 导出）
│   └── error-fallback.tsx      # 共享错误兜底 UI
├── hooks/                      # SWR 数据 hooks
├── lib/                        # 基础设施（env / config / ai / prisma / pdf / fetcher）
├── server/
│   ├── services/               # 业务编排层（chat / conversation / document）
│   ├── rag/                    # RAG 基础设施（chunker / embedder / retriever / prompt）
│   ├── auth.ts                 # 统一鉴权（requireUser）
│   └── http.ts                 # 统一错误处理（HttpError + apiHandler）
├── types/                      # 服务端 DTO 契约
└── prisma/schema.prisma        # 数据模型
```

## 快速开始

### 环境要求

- Node.js 20+
- pnpm（建议通过 corepack 启用，版本由 `package.json` 的 `packageManager` 字段锁定）
- PostgreSQL（需安装 `pgvector` 扩展）

### 安装依赖

```bash
corepack enable
pnpm install
```

### 配置环境变量

在项目根目录创建 `.env`：

```bash
# 数据库连接（必填）
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_chat"

# 百炼 API Key（必填）
DASHSCOPE_API_KEY="sk-xxxx"

# next-auth 密钥（必填）
AUTH_SECRET="xxxx"

# 以下为可选，括号内为默认值
DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
LLM_MODEL="qwen-plus"
EMBEDDING_MODEL="text-embedding-v3"
```

> 关键变量缺失时，服务启动即失败（由 `lib/env.ts` 的 zod 校验保证），不会带病运行。

### 准备数据库（Docker）

本地推荐用 Docker 一键启动 PostgreSQL + pgvector：

```bash
docker run -d \
  --name ai-chat-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_chat \
  -p 5432:5432 \
  --restart unless-stopped \
  pgvector/pgvector:pg17
```

### 初始化数据库

```bash
pnpm db:migrate   # 生成并应用迁移（含 pgvector 扩展）
pnpm db:seed      # （可选）灌入初始数据
```

`db:seed` 会创建默认登录账号：

| 邮箱 | 密码 |
|------|------|
| `admin@company.com` | `admin123` |

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 运行生产构建 |
| `pnpm lint` | ESLint 检查 |
| `pnpm test` | 运行 vitest 单元测试 |
| `pnpm db:migrate` | 生成并应用数据库迁移（开发环境） |
| `pnpm db:seed` | 执行种子脚本 |

> `prisma generate` 由 `postinstall` 自动触发，无需手动执行。

## 架构设计

### 分层结构

```
API Route（薄 HTTP 层）
   │  apiHandler 统一捕获错误 / requireUser 统一鉴权
   ▼
Service（业务编排层）
   │  校验、持久化、RAG 检索、流式编排
   ▼
Prisma（数据访问层）
```

- **Route 层**只做 HTTP 进出转换，不含业务逻辑
- **Service 层**编排业务流程，是 MySQL 等外部数据源未来的扩展接缝（经 AI SDK `tools` 注入）
- 横切关注点（鉴权、错误）收口在 `server/auth.ts` 与 `server/http.ts`

### RAG 检索增强流程

**入库**：上传文档 → 提取文本 → 分块（带重叠）→ 向量化 → 存入 pgvector

**问答**：用户提问 → 向量化 → 相似度检索 top-K → 拼装上下文提示词 → 流式调用 LLM

## 数据模型

| 模型 | 说明 |
|------|------|
| `User` | 用户（Credentials 登录） |
| `Document` | 文档元信息与处理状态（pending / processing / ready / error） |
| `DocumentChunk` | 文档分块及 1024 维向量（`vector(1024)`） |
| `Conversation` | 会话（按用户 + 更新时间索引） |
| `Message` | 消息（user / assistant） |

## 测试

当前覆盖纯逻辑函数的单元测试：

```bash
pnpm test
```

- `server/rag/chunker.test.ts`：分块长度、重叠、原文还原
- `server/services/conversation.service.test.ts`：标题截断
