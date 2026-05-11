import { ChatOpenAI } from "@langchain/openai";
import { tools } from "./tools.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, "../claudecode.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

/**
 * 获取 LLM 实例
 */
function getLLM(providerName, modelName) {
  const provider = (config.Providers || []).find(p => 
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
  const baseURL = (provider.api_base_url || "").split("/chat/completions")[0];
  
  console.log(`[LLM] Switching - Provider: ${provider.name}, Model: ${finalModel}, BaseURL: ${baseURL}`);

  return new ChatOpenAI({
    model: finalModel,
    temperature: 0.3,
    apiKey: provider.api_key,
    configuration: {
      baseURL: baseURL || undefined,
    }
  });
}

export async function* runAgentStream({ userId, sessionId = "default", message, provider, model, userProfile = {}, history = [] }) {
  console.log(`[Agent] Start Streaming - User: ${userId}, Session: ${sessionId}`);
  
  const llm = getLLM(provider, model);

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

  const agent = await createToolCallingAgent({
  llm,    // ① （"大脑" —— 负责理解、推理、生成）大语言模型实例（谁来思考和生成）--》getLLM(provider, model) 返回的 ChatOpenAI 实例
  tools,  // ② （"手脚" —— 负责执行具体任务）工具数组（Agent 可以调用哪些工具）--》[weatherTool, timeTool, knowledgeTool, ...] 数组
  prompt, // ③ （"性格" —— 定义 Agent 的行为规范）提示词模板（Agent 的行为规则和上下文格式）--》ChatPromptTemplate.fromMessages([...])
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    returnIntermediateSteps: true,
  });

  const chatHistory = history.map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content));

  try {
    const stream = await agentExecutor.stream({
      input: message,
      chat_history: chatHistory,
      user_profile: JSON.stringify(userProfile),
    });

    for await (const chunk of stream) {
      if (chunk.intermediateSteps) {
        // 发送中间思考步骤
        const thoughts = chunk.intermediateSteps.map(step => ({
          tool: step.action.tool,
          input: step.action.toolInput,
          output: step.observation
        }));
        yield { type: 'thoughts', data: thoughts };
      } else if (chunk.output) {
        // 发送最终回答片段
        yield { type: 'answer', data: chunk.output };
      }
    }
  } catch (error) {
    console.error(`[Agent] Stream Error:`, error.message);
    yield { type: 'error', data: error.message };
  }
}

/**
 * 运行 Agent (保留原有的非流式版本以防万一)
 */
export async function runAgent({ userId, sessionId = "default", message, provider, model, userProfile = {}, history = [] }) {
  console.log(`[Agent] Start Request - User: ${userId}, Session: ${sessionId}, Provider: ${provider || 'Default'}, Model: ${model || 'Default'}`);
  
  // 拿到模型-----》》模型
  const llm = getLLM(provider, model);


  /*
用户提问: "北京天气怎么样？"
    ↓
[Thought] 需要查询天气 → 决定调用 weather_tool
    ↓
[Action]  调用 weather_tool({ city: "北京" })
    ↓
[Observation] 返回: "北京今天晴，25°C"
    ↓
[Answer] 组织语言: "北京今天天气晴朗，气温25°C"
  */
  // 1. 定义 Prompt 模板------》写提示词模板------》提示
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

  // 2. 创建 Agent------》工具
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  // 3. 创建 Executor   执行 Agent------》》执行器
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    returnIntermediateSteps: true,
  });

  // 4. 转换历史记录为 LangChain 消息格式
  const chatHistory = new ChatMessageHistory(
    history.map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content))
  );

  // 5. 执行 Agent
  try {
    const result = await agentExecutor.invoke({
      input: message,
      chat_history: await chatHistory.getMessages(),
      user_profile: JSON.stringify(userProfile),
    });

    const answer = result.output;
    // 提取思考过程
    const thoughts = result.intermediateSteps?.map(step => ({
      tool: step.action.tool,
      input: step.action.toolInput,
      output: step.observation
    })) || [];

    return {
      answer,
      thoughts,
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

