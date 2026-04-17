import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

/**
 * 天气查询工具
 */
export const weatherTool = new DynamicStructuredTool({
  name: "get_weather",
  description: "查询指定城市的天气情况",
  schema: z.object({
    city: z.string().describe("要查询天气的城市名称"),
  }),
  func: async ({ city }) => {
    // 模拟天气数据
    return `${city}今天晴天，25°C，适合出行。`;
  },
});

/**
 * 时间查询工具
 */
export const timeTool = new DynamicStructuredTool({
  name: "get_current_time",
  description: "获取当前系统时间",
  schema: z.object({}),
  func: async () => {
    return new Date().toLocaleString("zh-CN", { hour12: false });
  },
});

/**
 * RAG 知识库工具
 */
const docs = [
  new Document({
    pageContent: "Vue 是一个用于构建用户界面的渐进式前端框架。它易于集成，性能优秀。",
    metadata: { title: "Vue 基础" },
  }),
  new Document({
    pageContent: "RAG (Retrieval-Augmented Generation) 的核心流程是：切分文档、向量化、存储检索、拼接上下文、LLM 生成回答。",
    metadata: { title: "RAG 基础" },
  }),
  new Document({
    pageContent: "LangChain 是一个用于开发由语言模型驱动的应用程序的框架。",
    metadata: { title: "LangChain 简介" },
  }),
];

let vectorStore;

async function getVectorStore() {
  if (!vectorStore) {
    vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
      })
    );
  }
  return vectorStore;
}

export const knowledgeTool = new DynamicStructuredTool({
  name: "search_knowledge",
  description: "在内部知识库中搜索关于 Vue, RAG, LangChain 等相关信息",
  schema: z.object({
    query: z.string().describe("搜索关键词或问题"),
  }),
  func: async ({ query }) => {
    const store = await getVectorStore();
    const results = await store.similaritySearch(query, 2);
    if (results.length === 0) return "知识库中未找到相关信息。";
    
    return results.map(doc => `[${doc.metadata.title}]: ${doc.pageContent}`).join("\n\n");
  },
});

// 导出所有工具列表
export const tools = [weatherTool, timeTool, knowledgeTool];
