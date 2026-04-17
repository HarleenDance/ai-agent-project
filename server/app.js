import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAgent } from "./agent/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, "./claudecode.json");

const app = express();
app.use(cors());
app.use(express.json());

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

app.post("/chat", async (req, res) => {
  try {
    const { userId = "u1", sessionId = "default", message = "", provider = "", model = "" } = req.body;
    
    if (!message) {
      return res.status(400).json({ code: 400, message: "message is required" });
    }
    const result = await runAgent({ userId, sessionId, message, provider, model });
    res.json({ code: 0, data: result });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({
      code: 500,
      message: error.message || "server error"
    });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});