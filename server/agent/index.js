import { ChatOpenAI } from "@langchain/openai";
import { tools } from "./tools.js";
import { getUserProfile, saveUserPreference, getSessionHistory, addMessageToHistory } from "./memory.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, "../claudecode.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

/**
 * 获取 LLM 实例
 */
function getLLM(providerName, modelName) {
  const provider = config.Providers.find(p => 
    p.name.toLowerCase().trim() === (providerName || "").toLowerCase().trim()
  );
  
  if (!provider) {
    console.log(`[LLM] Fallback: No provider found for "${providerName}", using default OpenAI config`);
    return new ChatOpenAI({
      model: modelName || "gpt-4o-mini",
      temperature: 0.3,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  const finalModel = modelName || provider.models[0];
  const baseURL = provider.api_base_url.split("/chat/completions")[0];
  
  console.log(`[LLM] Switching - Provider: ${provider.name}, Model: ${finalModel}, BaseURL: ${baseURL}`);

  return new ChatOpenAI({
    model: finalModel,
    temperature: 0.3,
    apiKey: provider.api_key,
    configuration: {
      baseURL: baseURL,
    }
  });
}

/**
 * 运行 Agent
 */
export async function runAgent({ userId, sessionId = "default", message, provider, model }) {
  console.log(`[Agent] Start Request - User: ${userId}, Session: ${sessionId}, Provider: ${provider || 'Default'}, Model: ${model || 'Default'}`);
  
  const profile = getUserProfile(userId);
  const llm = getLLM(provider, model);

  // 1. 定义 Prompt 模板
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `你是一个全能的 AI 助手。
请遵循以下规则：
1. 优先用中文回答。
2. 你可以调用工具来获取天气、时间、检索内部知识库、进行互联网搜索或查询维基百科。
3. 如果用户无法通过内部知识库回答，请尝试使用互联网搜索工具获取最新信息。
4. 如果用户询问学术性、历史性或定义性概念，请优先使用维基百科工具。
5. 当前用户画像信息：{user_profile}
`],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // 2. 创建 Agent
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  // 3. 创建 Executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    returnIntermediateSteps: true, // 开启返回中间步骤
  });

  // 4. 加载历史记录并转换为 LangChain 消息格式
  const rawHistory = getSessionHistory(sessionId);
  const chatHistory = new ChatMessageHistory(
    rawHistory.map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content))
  );

  // 5. 执行 Agent
  try {
    const result = await agentExecutor.invoke({
      input: message,
      chat_history: await chatHistory.getMessages(),
      user_profile: JSON.stringify(profile), // 将 profile 作为变量传入，避免模板解析错误
    });

    const answer = result.output;
    // 提取思考过程 (中间步骤)
    const thoughts = result.intermediateSteps?.map(step => ({
      tool: step.action.tool,
      input: step.action.toolInput,
      output: step.observation
    })) || [];

    // 6. 保存历史
    addMessageToHistory(sessionId, { role: "user", content: message });
    addMessageToHistory(sessionId, { role: "assistant", content: answer });

    // 7. 尝试提取用户偏好（简单逻辑，实际可用更高级的提取工具）
    if (message.includes("以后都用中文")) {
      saveUserPreference(userId, "language", "zh");
    }

    return {
      answer,
      thoughts, // 返回思考过程
      sessionId,
      usedModel: model || "gpt-4o-mini",
      usedProvider: provider || "OpenAI",
      intent: "agent_auto",
      toolResult: "自动执行工具"
    };
  } catch (error) {
    console.error(`[Agent] Execution Error:`, error.message);
    throw error;
  }
}
