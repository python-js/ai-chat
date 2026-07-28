import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 统一鉴权：路由组内所有页面共享，无需各自再写守卫
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fa]">
      {/* Suspense 包裹：Sidebar 内部使用 useSearchParams 读取当前会话 id */}
      <Suspense fallback={<aside className="w-64 border-r border-gray-200/80 bg-white" />}>
        <Sidebar />
      </Suspense>
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
