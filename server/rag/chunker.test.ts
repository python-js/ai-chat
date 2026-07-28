import { describe, it, expect } from "vitest";
import { chunkText } from "./chunker";

describe("chunkText", () => {
  it("空文本返回空数组", () => {
    expect(chunkText("")).toEqual([]);
  });

  it("短于分块大小的文本返回单个完整块", () => {
    const text = "你好世界";
    expect(chunkText(text, 800, 100)).toEqual([text]);
  });

  it("每个块长度不超过 size", () => {
    const text = "字".repeat(2000);
    const chunks = chunkText(text, 800, 100);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(800);
    }
  });

  it("相邻块之间带 overlap 重叠", () => {
    const text = Array.from({ length: 2000 }, (_, i) => String(i % 10)).join("");
    const chunks = chunkText(text, 800, 100);
    // 后一块以前一块的最后 overlap 个字符开头
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].startsWith(chunks[i - 1].slice(-100))).toBe(true);
    }
  });

  it("去除重叠后可还原原文（无丢失）", () => {
    const text = Array.from({ length: 2000 }, (_, i) => String(i % 10)).join("");
    const chunks = chunkText(text, 800, 100);
    const rebuilt = chunks[0] + chunks.slice(1).map((c) => c.slice(100)).join("");
    expect(rebuilt).toBe(text);
  });
});
