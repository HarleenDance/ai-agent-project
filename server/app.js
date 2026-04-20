import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAgent } from "./agent/index.js";
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

// 初始化数据库
initDatabase();

app.use(cors());
app.use(express.json());

// 获取配置接口
app.get("/config", (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    // Include api_key for frontend to display
    const safeConfig = {
      Providers: config.Providers.map(p => ({
        name: p.name,
        models: p.models,
        api_key: p.api_key,
        api_base_url: p.api_base_url
      }))
    };
    res.json({ code: 0, data: safeConfig });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Failed to load config" });
  }
});

// 获取用户画像接口
app.get("/profile", async (req, res) => {
  const { userId } = req.query;
  try {
    let user = await User.findByPk(userId);
    if (!user) {
      // 如果用户不存在，创建一个默认用户
      user = await User.create({ userId, name: "新用户", job: "开发者", preference: "简洁专业" });
    }
    res.json({ code: 0, data: user });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新用户画像接口
app.post("/profile", async (req, res) => {
  const { userId, name, job, preference } = req.body;
  try {
    let user = await User.findByPk(userId);
    if (user) {
      await user.update({ name, job, preference });
    } else {
      user = await User.create({ userId, name, job, preference });
    }
    res.json({ code: 0, data: user });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取所有会话列表接口
app.get("/sessions", async (req, res) => {
  const { userId } = req.query;
  try {
    const sessions = await Session.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']]
    });
    res.json({ code: 0, data: sessions });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取指定会话的历史记录接口
app.get("/messages", async (req, res) => {
  const { sessionId } = req.query;
  try {
    const messages = await Message.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']]
    });
    res.json({ code: 0, data: messages });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除会话接口
app.delete("/session", async (req, res) => {
  const { sessionId } = req.query;
  try {
    await Message.destroy({ where: { sessionId } });
    await Session.destroy({ where: { id: sessionId } });
    res.json({ code: 0, message: "删除成功" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

app.post("/chat", async (req, res) => {
  const { userId, sessionId, message, provider, model } = req.body;
  
  try {
    // 1. 确保会话存在
    let session = await Session.findByPk(sessionId);
    if (!session) {
      session = await Session.create({ 
        id: sessionId, 
        userId, 
        title: message.substring(0, 20) 
      });
    }

    // 2. 保存用户消息
    await Message.create({
      sessionId,
      role: "user",
      content: message
    });

    // 3. 调用 AI Agent
    const result = await runAgent({ userId, sessionId, message, provider, model });
    
    // 4. 保存 AI 回复
    await Message.create({
      sessionId,
      role: "assistant",
      content: result.answer,
      intent: result.intent,
      thoughts: result.thoughts,
      toolResult: result.toolResult
    });

    res.json({ code: 0, data: result });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});