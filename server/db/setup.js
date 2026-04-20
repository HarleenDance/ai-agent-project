import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

/**
 * 数据库自动创建脚本
 * 解决 MySQL 中库不存在导致 Sequelize 报错的问题
 */
async function setupDatabase() {
  const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
  };

  const dbName = process.env.DB_NAME || "ai_agent_db";

  try {
    const connection = await mysql.createConnection(config);
    console.log(`[Setup] 正在检查数据库 ${dbName}...`);
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    
    console.log(`[Setup] 数据库 ${dbName} 已就绪。`);
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("[Setup] 初始化失败:", error.message);
    process.exit(1);
  }
}

setupDatabase();
