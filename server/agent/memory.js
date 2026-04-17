const userMemory = new Map();
const sessionHistory = new Map();

export function saveUserPreference(userId, key, value) {
  if (!userMemory.has(userId)) {
    userMemory.set(userId, {});
  }
  const profile = userMemory.get(userId);
  profile[key] = value;
}

export function getUserProfile(userId) {
  return userMemory.get(userId) || {};
}

/**
 * 获取会话历史记录
 * @param {string} sessionId 
 * @returns {Array} 消息列表
 */
export function getSessionHistory(sessionId) {
  return sessionHistory.get(sessionId) || [];
}

/**
 * 添加消息到会话历史
 * @param {string} sessionId 
 * @param {Object} message { role: 'user' | 'assistant', content: string }
 */
export function addMessageToHistory(sessionId, message) {
  if (!sessionHistory.has(sessionId)) {
    sessionHistory.set(sessionId, []);
  }
  const history = sessionHistory.get(sessionId);
  history.push(message);
  
  // 保持最近 20 条消息，防止上下文过长
  if (history.length > 20) {
    history.shift();
  }
}

/**
 * 清除会话历史
 * @param {string} sessionId 
 */
export function clearSessionHistory(sessionId) {
  sessionHistory.delete(sessionId);
}