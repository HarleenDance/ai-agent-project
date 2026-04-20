import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "ai_agent_db",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "root",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false, // 设置为 true 可在控制台查看 SQL 日志
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log("[Database] MySQL 连接成功。");
    
    // 同步模型到数据库
    await sequelize.sync({ alter: true });
    console.log("[Database] 数据库表结构同步完成。");
  } catch (error) {
    console.error("[Database] 无法连接到数据库:", error.message);
    console.warn("⚠️ 请确保本地 MySQL 已启动，且账号密码为 root/root，并已创建库 ai_agent_db");
  }
}

export default sequelize;
