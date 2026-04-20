/*
 AI Agent System - 数据库初始化脚本
 适用数据库：MySQL 8.0+
 默认库名：ai_agent_db
*/

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS `ai_agent_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `ai_agent_db`;

-- 2. 创建用户表 (Users)
CREATE TABLE IF NOT EXISTS `Users` (
  `userId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT '用户 1',
  `job` VARCHAR(255) DEFAULT '开发者',
  `preference` VARCHAR(255) DEFAULT '简洁专业',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB;

-- 3. 创建会话表 (Sessions)
CREATE TABLE IF NOT EXISTS `Sessions` (
  `id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) DEFAULT '新的对话',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `userId` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `Users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. 创建消息表 (Messages)
CREATE TABLE IF NOT EXISTS `Messages` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `role` ENUM('user', 'assistant') NOT NULL,
  `content` TEXT NOT NULL,
  `intent` VARCHAR(255),
  `thoughts` JSON,
  `toolResult` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `sessionId` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`sessionId`) REFERENCES `Sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. 插入初始化演示数据
INSERT IGNORE INTO `Users` (`userId`, `name`, `job`, `preference`, `createdAt`, `updatedAt`)
VALUES ('u1', '演示用户', '全栈工程师', '简洁专业', NOW(), NOW());

INSERT IGNORE INTO `Sessions` (`id`, `title`, `userId`, `createdAt`, `updatedAt`)
VALUES ('default', '欢迎使用 AI Agent', 'u1', NOW(), NOW());

INSERT IGNORE INTO `Messages` (`role`, `content`, `sessionId`, `createdAt`, `updatedAt`)
VALUES ('assistant', '你好！我是您的 AI 助手，数据库已连接成功。', 'default', NOW(), NOW());
