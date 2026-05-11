import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAgent, runAgentStream } from "./agent/index.js";
import { initDatabase } from "./db/index.js";
import { User, Session, Message } from "./db/models.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, "./claudecode.json");

const app = express();
const PORT = process.env.PORT || 3000;
/*
用户输入消息
    ↓
前端 api.js → POST /chat { userId, sessionId, message }
    ↓
后端 app.js → 处理请求 → 调用 Agent
    ↓
返回结果 → 前端渲染
*/
app.use(cors());
app.use(express.json());

// 获取配置接口
app.get("/config", (req, res) => {
  try {
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ code: 404, message: "Config file not found" });
    }
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    // Include api_key for frontend to display
    const safeConfig = {
      Providers: (config.Providers || []).map(p => ({
        name: p.name,
        models: p.models,
        api_key: p.api_key,
        api_base_url: p.api_base_url
      }))
    };
    res.json({ code: 0, data: safeConfig });
  } catch (error) {
    console.error("[Config Error]", error);
    res.status(500).json({ code: 500, message: "Failed to load config: " + error.message });
  }
});

// 获取用户画像接口
app.get("/profile", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ code: 400, message: "Missing userId" });
  }
  try {
    let user = await User.findByPk(userId);
    if (!user) {
      // 如果用户不存在，创建一个默认用户
      user = await User.create({ userId, name: "新用户", job: "开发者", preference: "简洁专业" });
    }
    res.json({ code: 0, data: user });
  } catch (error) {
    console.error("[Profile Error]", error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新用户画像接口
app.post("/profile", async (req, res) => {
  const { userId, name, job, preference } = req.body;
  if (!userId) {
    return res.status(400).json({ code: 400, message: "Missing userId" });
  }
  try {
    let user = await User.findByPk(userId);
    if (user) {
      await user.update({ name, job, preference });
    } else {
      user = await User.create({ userId, name, job, preference });
    }
    res.json({ code: 0, data: user });
  } catch (error) {
    console.error("[Profile Update Error]", error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取所有会话列表接口
app.get("/sessions", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ code: 400, message: "Missing userId" });
  }
  try {
    const sessions = await Session.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']]
    });
    res.json({ code: 0, data: sessions });
  } catch (error) {
    console.error("[Sessions Error]", error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取指定会话的历史记录接口
app.get("/messages", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ code: 400, message: "Missing sessionId" });
  }
  try {
    const messages = await Message.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']]
    });
    res.json({ code: 0, data: messages });
  } catch (error) {
    console.error("[Messages Error]", error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除会话接口
app.delete("/session", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ code: 400, message: "Missing sessionId" });
  }
  try {
    await Message.destroy({ where: { sessionId } });
    await Session.destroy({ where: { id: sessionId } });
    res.json({ code: 0, message: "删除成功" });
  } catch (error) {
    console.error("[Session Delete Error]", error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

app.post("/chat", async (req, res) => {
  const { userId, sessionId, message, provider, model } = req.body;
  
  if (!userId || !sessionId || !message) {
    return res.status(400).json({ code: 400, message: "Missing required fields (userId, sessionId, message)" });
  }
  
  try {
    // 1. 确保用户存在
    let user = await User.findByPk(userId);
    if (!user) {
      user = await User.create({ userId, name: "新用户", job: "开发者", preference: "简洁专业" });
    }

    // 2. 确保会话存在
    let session = await Session.findByPk(sessionId);
    if (!session) {
      session = await Session.create({ 
        id: sessionId, 
        userId, 
        title: message.substring(0, 20) 
      });
    } else {
      session.changed('updatedAt', true);
      await session.save();
    }

    // 3. 获取历史记录
    const historyData = await Message.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']],
      limit: 10 
    });
    const history = historyData.map(h => ({ role: h.role, content: h.content }));

    // 4. 保存用户消息
    await Message.create({
      sessionId,
      role: "user",
      content: message
    });

    // 设置响应头为 SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullAnswer = "";
    let finalThoughts = [];

    // 5. 调用流式 Agent
    for await (const chunk of runAgentStream({ 
      userId, 
      sessionId, 
      message, 
      provider, 
      model,
      userProfile: user,
      history: history
    })) {
      if (chunk.type === 'thoughts') {
        finalThoughts = chunk.data;
        res.write(`data: ${JSON.stringify({ type: 'thoughts', data: chunk.data })}\n\n`);
      } else if (chunk.type === 'answer') {
        fullAnswer += chunk.data;
        res.write(`data: ${JSON.stringify({ type: 'answer', data: chunk.data })}\n\n`);
      } else if (chunk.type === 'error') {
        res.write(`data: ${JSON.stringify({ type: 'error', data: chunk.data })}\n\n`);
      }
    }

    // 6. 结束后保存 AI 回复到数据库
    await Message.create({
      sessionId,
      role: "assistant",
      content: fullAnswer,
      intent: "agent_stream",
      thoughts: finalThoughts,
      toolResult: "流式执行完成"
    });

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error(`[Chat Error]`, error);
    if (!res.headersSent) {
      res.status(500).json({ code: 500, message: error.message || "Internal Server Error" });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', data: error.message })}\n\n`);
      res.end();
    }
  }
});

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();