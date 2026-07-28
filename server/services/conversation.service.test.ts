import { describe, it, expect } from "vitest";
import { truncateTitle } from "./conversation.service";
import { config } from "@/lib/config";

describe("truncateTitle", () => {
  const max = config.conversation.titleMaxLength;

  it("短标题保持不变", () => {
    expect(truncateTitle("如何退款")).toBe("如何退款");
  });

  it("恰好等于上限的标题保持不变", () => {
    const title = "标".repeat(max);
    expect(truncateTitle(title)).toBe(title);
  });

  it("超长标题截断为前 N 个字符", () => {
    const title = "标".repeat(max + 50);
    const result = truncateTitle(title);
    expect(result.length).toBe(max);
    expect(result).toBe("标".repeat(max));
  });

  it("空字符串返回空", () => {
    expect(truncateTitle("")).toBe("");
  });
});
