import axios from "axios";

// 自动根据环境变量切换 API 地址，如果没有则默认为本地
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const instance = axios.create({
  baseURL: API_BASE_URL
});

export function chat(data) {
  return instance.post("/chat", data);
}

export async function getModelsConfig() {
  return instance.get("/config");
}