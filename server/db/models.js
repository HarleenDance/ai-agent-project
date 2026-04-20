import { DataTypes } from "sequelize";
import sequelize from "./index.js";

/**
 * 用户模型
 */
export const User = sequelize.define("User", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: "用户 1",
  },
  job: {
    type: DataTypes.STRING,
    defaultValue: "开发者",
  },
  preference: {
    type: DataTypes.STRING,
    defaultValue: "简洁专业",
  }
}, {
  timestamps: true
});

/**
 * 对话会话模型
 */
export const Session = sequelize.define("Session", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: "新的对话",
  }
}, {
  timestamps: true
});

/**
 * 消息记录模型
 */
export const Message = sequelize.define("Message", {
  role: {
    type: DataTypes.ENUM("user", "assistant"),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  intent: {
    type: DataTypes.STRING,
  },
  thoughts: {
    type: DataTypes.JSON, // 存储思考过程 JSON
  },
  toolResult: {
    type: DataTypes.TEXT,
  }
}, {
  timestamps: true
});

// 建立关联关系
User.hasMany(Session, { foreignKey: "userId" });
Session.belongsTo(User, { foreignKey: "userId" });

Session.hasMany(Message, { foreignKey: "sessionId" });
Message.belongsTo(Session, { foreignKey: "sessionId" });
