<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside :class="['sidebar', { collapsed: isSidebarCollapsed }]">
      <div class="sidebar-header">
        <button @click="createNewSession" class="new-chat-btn">
          <span class="icon">➕</span>
          <span>新建对话</span>
        </button>
        <button @click="isSidebarCollapsed = !isSidebarCollapsed" class="toggle-sidebar-btn">
          {{ isSidebarCollapsed ? '→' : '←' }}
        </button>
      </div>
      <div class="session-list">
        <div 
          v-for="session in sessions" 
          :key="session.id" 
          :class="['session-item', { active: currentSessionId === session.id }]"
          @click="switchSession(session.id)"
        >
          <span class="session-icon">💬</span>
          <span class="session-title">{{ session.title }}</span>
          <button @click.stop="deleteSession(session.id)" class="delete-btn">🗑️</button>
        </div>
      </div>
      <div class="sidebar-footer">
        <div class="user-profile-mini">
          <div class="user-info-left">
            <div class="avatar-circle">U</div>
            <span>用户 1</span>
          </div>
          <div class="user-tools">
            <button @click="openYuque" class="tools-btn" title="语雀笔记">📝</button>
            <button @click="openWaimaoTools" class="tools-btn" title="外贸工具集合">🛠️</button>
            <button @click="showUserSettings = true" class="tools-btn" title="个人设置">⚙️</button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Settings Overlay -->
    <transition name="fade">
      <div v-if="showUserSettings" class="prompt-library-overlay" @click.self="showUserSettings = false">
        <div class="prompt-library-modal settings-modal">
          <div class="modal-header">
            <h3>个人设置与偏好</h3>
            <button @click="showUserSettings = false" class="close-modal">×</button>
          </div>
          <div class="modal-body">
            <div class="settings-group">
              <label>您的称呼</label>
              <input v-model="userProfile.name" type="text" placeholder="例如：小明">
            </div>
            <div class="settings-group">
              <label>职业/角色</label>
              <input v-model="userProfile.job" type="text" placeholder="例如：高级架构师、学生">
            </div>
            <div class="settings-group">
              <label>AI 回复风格偏好</label>
              <select v-model="userProfile.preference">
                <option value="简洁专业">简洁专业 (默认)</option>
                <option value="幽默风趣">幽默风趣</option>
                <option value="详细严谨">详细严谨</option>
                <option value="创意发散">创意发散</option>
              </select>
            </div>
            <div class="settings-info">
              💡 设置后的偏好将直接影响 AI 的回复语气和专业深度。
            </div>
          </div>
          <div class="modal-footer">
            <button @click="saveSettings" class="save-btn">保存并应用</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Content -->
    <div class="main-content">
      <header class="app-header">
        <div class="header-left">
          <button v-if="isSidebarCollapsed" @click="isSidebarCollapsed = false" class="mobile-menu-btn">☰</button>
          <div class="header-title">AI Agent</div>
        </div>
        
        <div class="model-selector-container">
          <div class="custom-selector">
            <select v-model="selectedProvider" class="minimal-select provider-select">
              <option value="">默认 (OpenAI)</option>
              <option v-for="p in providers" :key="p.name" :value="p.name">{{ p.name }}</option>
            </select>
            <span class="selector-divider">/</span>
            <select v-model="selectedModel" class="minimal-select model-select">
              <option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>
        <div class="header-right">
          <button @click="showKnowledgeCenter = true" class="header-action-btn" title="AI Agent 知识图谱">📚</button>
          <button @click="toggleDarkMode" class="header-action-btn" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
          <button @click="exportChat" class="header-action-btn" title="导出对话">📥</button>
        </div>

      <!-- Knowledge Center Modal -->
      <transition name="fade">
        <div v-if="showKnowledgeCenter" class="prompt-library-overlay" @click.self="showKnowledgeCenter = false">
          <div class="prompt-library-modal knowledge-modal">
            <div class="modal-header">
              <h3>AI Agent 全链路知识体系</h3>
              <button @click="showKnowledgeCenter = false" class="close-modal">×</button>
            </div>
            <div class="modal-body">
              <div class="knowledge-grid">
                <div class="k-section">
                  <h4>🧠 核心能力 (LLM)</h4>
                  <ul>
                    <li>理解用户意图 (NLP)</li>
                    <li>推理 (Reasoning)</li>
                    <li>规划 (Planning)</li>
                    <li>工具调用 (Tool Calling)</li>
                  </ul>
                </div>
                <div class="k-section">
                  <h4>🛠️ 关键技术</h4>
                  <ul>
                    <li><b>RAG</b>: 检索增强生成，减少幻觉</li>
                    <li><b>Memory</b>: 长期/短期记忆系统</li>
                    <li><b>MCP</b>: 标准化工具连接协议</li>
                    <li><b>LangGraph</b>: 基于状态机的 Agent 编排</li>
                  </ul>
                </div>
                <div class="k-section">
                  <h4>🏗️ 企业级架构</h4>
                  <ul>
                    <li>API Gateway & 安全审计</li>
                    <li>SSE / WebSocket 流式输出</li>
                    <li>多智能体协作 (Multi-Agent)</li>
                    <li>监控与链路追踪 (Tracing)</li>
                  </ul>
                </div>
              </div>
              <div class="knowledge-footer">
                🚀 当前项目已实现：MySQL 记忆、RAG 知识库、SSE 流式、多模型切换、工具调用可视化。
              </div>
            </div>
          </div>
        </div>
      </transition>
      </header>

      <!-- Prompt Library Overlay -->
      <transition name="fade">
        <div v-if="showPromptLibrary" class="prompt-library-overlay" @click.self="showPromptLibrary = false">
          <div class="prompt-library-modal">
            <div class="modal-header">
              <h3>提示词库</h3>
              <button @click="showPromptLibrary = false" class="close-modal">×</button>
            </div>
            
            <div class="modal-body">
              <div class="library-toolbar">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input v-model="searchQuery" placeholder="搜索提示词..." type="text">
                </div>
                <div class="category-tabs">
                  <button 
                    v-for="cat in categories" 
                    :key="cat" 
                    :class="['cat-tab', { active: selectedCategory === cat }]"
                    @click="selectedCategory = cat"
                  >
                    {{ cat }}
                  </button>
                </div>
              </div>

              <div class="prompt-grid">
                <div 
                  v-for="p in filteredPrompts" 
                  :key="p.id" 
                  class="prompt-card"
                  @click="usePrompt(p.content)"
                >
                  <div class="card-header">
                    <span class="card-category">{{ p.category }}</span>
                    <h4 class="card-title">{{ p.title }}</h4>
                  </div>
                  <p class="card-desc">{{ p.description }}</p>
                  <div class="card-footer">
                    <span class="use-btn">立即使用</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Provider Details Floating Panel (Optional/Toggleable) -->
      <transition name="fade">
        <div v-if="showConfigDetails && selectedProviderDetails" class="floating-config-panel">
          <div class="detail-row">
            <label>API Base:</label> <code>{{ selectedProviderDetails.api_base_url }}</code>
          </div>
          <div class="detail-row">
            <label>API Key:</label> <code>{{ selectedProviderDetails.api_key }}</code>
          </div>
          <button @click="showConfigDetails = false" class="close-panel">×</button>
        </div>
      </transition>

      <main class="chat-main" ref="chatMain">
        <div v-if="currentHistory.length === 0" class="welcome-container">
          <div class="welcome-logo">🤖</div>
          <h1>今天我能帮您做些什么？</h1>
          <div class="quick-actions">
            <div class="action-card" @click="message = '北京今天天气怎么样？'; handleSend()">
              <span class="action-icon">🌤️</span>
              <div class="action-text">
                <b>查询天气</b>
                <p>了解指定城市的实时天气</p>
              </div>
            </div>
            <div class="action-card" @click="message = '搜索最新的 AI 技术趋势'; handleSend()">
              <span class="action-icon">🌐</span>
              <div class="action-text">
                <b>互联网搜索</b>
                <p>利用插件搜索最新实时信息</p>
              </div>
            </div>
            <div class="action-card" @click="message = '维基百科查询量子力学的基础概念'; handleSend()">
              <span class="action-icon">📖</span>
              <div class="action-text">
                <b>百科全书</b>
                <p>深入查询维基百科详细条目</p>
              </div>
            </div>
            <div class="action-card" @click="message = '解释一下什么是 RAG？'; handleSend()">
              <span class="action-icon">📚</span>
              <div class="action-text">
                <b>知识库检索</b>
                <p>基于 RAG 技术查询内部文档</p>
              </div>
            </div>
            <div class="action-card" @click="message = '现在几点了？'; handleSend()">
              <span class="action-icon">⏰</span>
              <div class="action-text">
                <b>查看时间</b>
                <p>获取当前系统准确时间</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat History -->
        <div class="messages-wrapper">
          <div v-for="(item, index) in currentHistory" :key="index" :class="['message-row', item.role]">
            <div class="message-container">
              <!-- AI Avatar (Left) -->
              <div v-if="item.role === 'assistant'" class="avatar-box">
                <div class="avatar assistant">🤖</div>
              </div>
              
              <div class="message-content-wrapper">
                <div class="role-label">{{ item.role === 'user' ? '您' : 'AI 助手' }}</div>
                <div class="message-content">
                  <div class="text-body">
                    <p v-if="item.role === 'user'">{{ item.content }}</p>
                    <div v-else>
                      <!-- Thought Process (Intermediate Steps) -->
                      <div v-if="item.thoughts && item.thoughts.length > 0" class="thought-container">
                        <details open>
                          <summary class="thought-summary">
                            <div class="thought-header-left">
                              <span class="thought-icon spinning" v-if="item.loading">⏳</span>
                              <span class="thought-icon" v-else>✅</span>
                              <b>思考与工具调用</b>
                            </div>
                            <span class="thought-badge">{{ item.thoughts.length }} 个步骤</span>
                          </summary>
                          <div class="thought-steps">
                            <div v-for="(step, sIdx) in item.thoughts" :key="sIdx" class="thought-step">
                              <div class="step-line"></div>
                              <div class="step-content">
                                <div class="step-header">
                                  <span class="step-num">{{ sIdx + 1 }}</span>
                                  调用工具: <code>{{ step.tool }}</code>
                                </div>
                                <div class="step-io">
                                  <div class="io-box">
                                    <span class="io-label">输入:</span> 
                                    <code>{{ step.input }}</code>
                                  </div>
                                  <div class="io-box output" v-if="step.output">
                                    <span class="io-label">输出:</span> 
                                    <pre>{{ step.output }}</pre>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </details>
                      </div>

                      <div v-if="item.intent && item.intent !== 'agent_auto'" class="tag-row">
                        <span class="intent-tag">{{ item.intent }}</span>
                      </div>
                      <div class="markdown-content" v-html="renderMarkdown(item.content)"></div>
                      <div v-if="item.toolResult && item.toolResult !== '自动执行工具'" class="tool-expansion">
                        <details>
                          <summary>工具调用详情</summary>
                          <pre>{{ item.toolResult }}</pre>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- User Avatar (Right) -->
              <div v-if="item.role === 'user'" class="avatar-box">
                <div class="avatar user">U</div>
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="loading" class="message-row assistant">
            <div class="message-container">
              <div class="avatar-box">
                <div class="avatar assistant">🤖</div>
              </div>
              <div class="message-content">
                <div class="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-toast">
          <span class="error-icon">⚠️</span>
          <p>{{ error }}</p>
          <button @click="error = ''" class="close-toast">×</button>
        </div>
      </main>

      <footer class="app-footer">
        <div class="input-container-outer">
          <div class="input-container-inner">
            <button class="attach-btn" @click="showPromptLibrary = !showPromptLibrary" title="提示词库">💡</button>
            <button class="attach-btn" @click="openCommunityPrompts" title="社区提示词 (外部)">🌐</button>
            <button class="attach-btn" @click="showConfigDetails = !showConfigDetails" title="查看配置详情">⚙️</button>
            <textarea
              v-model="message"
              placeholder="给 AI 助手发送消息..."
              @keydown.enter.prevent="handleSend"
              :disabled="loading"
              ref="inputRef"
              rows="1"
              @input="adjustTextareaHeight"
            ></textarea>
            <button 
              @click="handleSend" 
              :disabled="loading || !message.trim()" 
              class="send-icon-btn"
            >
              <svg v-if="!loading" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-else class="mini-spinner"></span>
            </button>
          </div>
          <p class="disclaimer">AI 可能会产生错误信息，请核实重要内容。</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useDark, useToggle, useScroll } from "@vueuse/core";
import { chat, getUserProfile, saveUserProfile, getSessions, getSessionMessages, deleteSessionApi, getModelsConfig } from "./api";
import configData from "./components/claudecode.json";
import promptData from "./assets/prompts.json";
import MarkdownIt from "markdown-it";
import mdHighlight from "markdown-it-highlightjs";
import mdKatex from "markdown-it-katex";
import "katex/dist/katex.min.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; 

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
.use(mdHighlight, { hljs })
.use(mdKatex);

// 自定义渲染代码块以添加复制按钮
const defaultRender = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.fence = function(tokens, idx, options, env, self) {
  const token = tokens[idx];
  const code = token.content.trim();
  const lang = token.info.trim();
  const highlighted = options.highlight ? options.highlight(code, lang) : md.utils.escapeHtml(code);
  
  return `<div class="code-block-wrapper" style="position: relative; margin: 1em 0;">
            <button class="copy-code-btn" onclick="copyToClipboard(this)" style="position: absolute; top: 10px; right: 10px; z-index: 10; padding: 4px 8px; font-size: 12px; background: rgba(255,255,255,0.9); border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">复制</button>
            <pre class="hljs"><code>${highlighted}</code></pre>
          </div>`;
};

/* 全局复制函数 */
window.copyToClipboard = function(btn) {
  // 修改选择器以适应 markdown-it 生成的结构
  const code = btn.nextElementSibling.innerText;
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.innerText;
    btn.innerText = "已复制!";
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove('copied');
    }, 2000);
  });
};

// 深色模式切换
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});
const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  console.log("Dark mode toggled:", isDark.value);
};

function renderMarkdown(content) {
  return md.render(content || "");
}

const message = ref("");
const loading = ref(false);
const error = ref("");
const chatMain = ref(null);
const inputRef = ref(null);
const isSidebarCollapsed = ref(false);
const showConfigDetails = ref(false);
const showPromptLibrary = ref(false);
const showUserSettings = ref(false);
const showKnowledgeCenter = ref(false);
const userProfile = ref({
  name: "用户 1",
  job: "开发者",
  preference: "简洁专业"
});

const searchQuery = ref("");
const selectedCategory = ref("全部");

// 保存设置
async function saveSettings() {
  try {
    const res = await saveUserProfile({
      userId: "u1",
      ...userProfile.value
    });
    if (res.data.code === 0) {
      showUserSettings.value = false;
      alert("设置已成功同步到数据库！");
    }
  } catch (err) {
    alert("保存失败：" + err.message);
  }
}

async function loadProfile() {
  try {
    const res = await getUserProfile("u1");
    if (res.data.code === 0 && res.data.data) {
      userProfile.value = res.data.data;
    }
  } catch (err) {
    console.error("加载画像失败:", err);
  }
}

async function loadSessions() {
  try {
    const res = await getSessions("u1");
    if (res.data.code === 0) {
      const dbSessions = (res.data.data || []).map(s => ({
        ...s,
        history: []
      }));
      sessions.value = dbSessions;
      if (sessions.value.length > 0) {
        currentSessionId.value = sessions.value[0].id;
        await loadMessages(currentSessionId.value);
      } else {
        createNewSession();
      }
    }
  } catch (err) {
    console.error("加载会话失败:", err);
    if (sessions.value.length === 0) {
      createNewSession();
    }
  }
}

async function loadMessages(sessionId) {
  try {
    const res = await getSessionMessages(sessionId);
    if (res.data.code === 0) {
      const session = sessions.value.find(s => s.id === sessionId);
      if (session) {
        session.history = (res.data.data || []).map(m => ({
          role: m.role,
          content: m.content,
          thoughts: m.thoughts || [],
          toolResult: m.toolResult
        }));
      }
    }
  } catch (err) {
    console.error("加载消息失败:", err);
    // 确保 history 始终是数组
    const session = sessions.value.find(s => s.id === sessionId);
    if (session && !Array.isArray(session.history)) {
      session.history = [];
    }
  }
}

// 导出对话
function exportChat() {
  const session = sessions.value.find(s => s.id === currentSessionId.value);
  if (!session || !session.history || session.history.length === 0) {
    alert("当前对话为空，无法导出。");
    return;
  }
  
  let md = `# ${session.title}\n\n`;
  session.history.forEach(m => {
    const role = m.role === 'user' ? '👤 您' : '🤖 AI';
    md += `### ${role}\n${m.content}\n\n---\n\n`;
  });
  
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// Prompt Library
const categories = computed(() => {
  const cats = new Set(promptData.map(p => p.category));
  return ["全部", ...Array.from(cats)];
});

const filteredPrompts = computed(() => {
  return promptData.filter(p => {
    const matchesCategory = selectedCategory.value === "全部" || p.category === selectedCategory.value;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

function openCommunityPrompts() {
  window.open("https://www.aishort.top/community-prompts", "_blank");
}

function openWaimaoTools() {
  if (confirm("是否打开外贸百科工具集合网站？")) {
    window.open("https://waimao21.com/", "_blank");
  }
}

function openYuque() {
  if (confirm("是否打开语雀个人工作台？")) {
    window.open("https://www.yuque.com/dashboard/notes", "_blank");
  }
}

function usePrompt(content) {
  console.log("Using prompt content:", content); // 添加日志确认内容
  message.value = content;
  showPromptLibrary.value = false;
  
  // 使用 setTimeout 确保在 Vue 数据同步和 DOM 更新后执行
  setTimeout(() => {
    if (inputRef.value) {
      // 鲁棒性增强：直接操作 DOM 赋值，确保 v-model 没来得及同步时也能显示
      inputRef.value.value = content; 
      adjustTextareaHeight();
      inputRef.value.focus();
      // 兼容性更好的滚动方式
      inputRef.value.setSelectionRange(content.length, content.length);
      inputRef.value.scrollTop = 0; 
    }
  }, 50);
}

// 监听 message 变化，自动调整高度
watch(message, () => {
  nextTick(() => {
    adjustTextareaHeight();
  });
});

// Session Management
const sessions = ref([
  { id: 'default', title: '新的对话', history: [] }
]);
const currentSessionId = ref('default');

const currentHistory = computed(() => {
  const session = sessions.value.find(s => s.id === currentSessionId.value);
  return session?.history ?? [];
});

const providers = ref([]);
const selectedProvider = ref("");
const selectedModel = ref("gpt-4o-mini");

const selectedProviderDetails = computed(() => {
  const p = providers.value.find(p => p.name === selectedProvider.value);
  return p || null;
});

const availableModels = computed(() => {
  return selectedProviderDetails.value ? selectedProviderDetails.value.models : ["gpt-4o-mini"];
});

watch(selectedProvider, (newVal) => {
  if (newVal) {
    const p = providers.value.find(p => p.name === newVal);
    selectedModel.value = p?.models[0] || "";
  } else {
    selectedModel.value = "gpt-4o-mini";
  }
});

function createNewSession() {
  const newId = Date.now().toString();
  sessions.value.unshift({
    id: newId,
    title: '新的对话',
    history: []
  });
  currentSessionId.value = newId;
  error.value = "";
  nextTick(() => inputRef.value?.focus());
}

function switchSession(id) {
  currentSessionId.value = id;
  error.value = "";
  loadMessages(id).then(() => {
    scrollToBottom();
    nextTick(() => inputRef.value?.focus());
  });
}

async function deleteSession(id) {
  if (!confirm("确定要删除此对话吗？")) return;
  try {
    const res = await deleteSessionApi(id);
    if (res.data.code === 0) {
      const index = sessions.value.findIndex(s => s.id === id);
      if (index !== -1) {
        sessions.value.splice(index, 1);
        if (sessions.value.length === 0) {
          createNewSession();
        } else if (currentSessionId.value === id) {
          currentSessionId.value = sessions.value[0].id;
          loadMessages(currentSessionId.value);
        }
      }
    }
  } catch (err) {
    alert("删除失败");
  }
}

function adjustTextareaHeight() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}

function scrollToBottom() {
  nextTick(() => {
    if (chatMain.value) {
      chatMain.value.scrollTo({
        top: chatMain.value.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
}

function getErrorMessage(msg) {
  if (!msg) return "遇到了一些问题，请稍后再试。";
  if (msg.includes("429") || msg.includes("quota")) {
    return "API 额度已耗尽。请检查账户余额。";
  }
  if (msg.includes("401")) {
    return "API Key 无效或配置错误。";
  }
  return msg;
}

async function handleSend() {
  const content = message.value.trim();
  if (!content || loading.value) return;

  const currentSession = sessions.value.find(s => s.id === currentSessionId.value);
  if (!currentSession) return;

  if (currentSession.history.length === 0) {
    currentSession.title = content.substring(0, 20) + (content.length > 20 ? '...' : '');
  }

  currentSession.history.push({ role: "user", content });
  message.value = "";
  loading.value = true;
  error.value = "";
  
  const newMessage = {
    role: "assistant",
    content: "",
    thoughts: [],
    loading: true
  };
  currentSession.history.push(newMessage);

  nextTick(() => {
    adjustTextareaHeight();
    scrollToBottom();
  });

  try {
    // 第一步：用 fetch 发请求（不是 axios，因为需要流式读取）
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: "u1",
        sessionId: currentSessionId.value,
        message: content,
        provider: selectedProvider.value,
        model: selectedModel.value,
        userProfile: userProfile.value
      })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
// 第二步：获取 ReadableStream 的读取器
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    // 第三步：循环读取数据块（关键！）
    while (true) {
      const { value, done } = await reader.read(); // 读一块
      if (done) break; // 读完了就退出
      
      const chunk = decoder.decode(value); // 二进制 → 文字
      const lines = chunk.split('\n'); // 按行分割
      
      for (const line of lines) {
        if (line.startsWith('data: ')) { // SSE 格式：每行以 "data: " 开头
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') {
            newMessage.loading = false;
            break;
          }
          
          try {
            const parsed = JSON.parse(dataStr);// 解析 JSON
            if (parsed.type === 'thoughts') {
              newMessage.thoughts = parsed.data;// 更新工具调用步骤
            } else if (parsed.type === 'answer') {
              newMessage.content += parsed.data;// 实时追加文字到气泡中
            } else if (parsed.type === 'error') {
              error.value = parsed.data;// 更新错误信息
            }
            // 自动滚动到底部
            scrollToBottom();
          } catch (e) {
            console.warn("Error parsing SSE chunk:", e);
          }
        }
      }
    }
//     后端每生成一个 token
//     ↓
// 通过 SSE 发送: data: {"type":"answer","data":"你"}
//     ↓
// 前端 reader.read() 读到这一块
//     ↓
// 解析 JSON，把 "你" 追加到 newMessage.content
//     ↓
// Vue 响应式更新 → 气泡里出现 "你"
//     ↓
// 后端继续生成下一个 token...
//     ↓
// 循环，直到收到 data: [DONE]
  } catch (err) {
    error.value = getErrorMessage(err.message);
    newMessage.loading = false;
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}

async function loadConfig() {
  try {
    const res = await getModelsConfig();
    if (res.data.code === 0 && res.data.data) {
      providers.value = res.data.data.Providers || [];
      if (providers.value.length > 0) {
        selectedProvider.value = providers.value[0].name;
        selectedModel.value = providers.value[0].models[0];
      }
    }
  } catch (err) {
    console.error("加载配置失败:", err);
  }
}

onMounted(() => {
  inputRef.value?.focus();
  loadConfig();
  loadProfile();
  loadSessions();
});
</script>

<style>
/* 全局变量定义，不使用 scoped 以确保深色模式生效 */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9f9f9;
  --bg-header: rgba(255, 255, 255, 0.85);
  --bg-chat-user: #95ec69;
  --bg-chat-ai: #f4f4f5;
  --text-primary: #0d0d0d;
  --text-secondary: #666666;
  --border-color: #e5e5e5;
  --input-bg: #ffffff;
  --hover-color: #ececec;
}

html.dark {
  --bg-primary: #171717;
  --bg-secondary: #212121;
  --bg-header: rgba(23, 23, 23, 0.85);
  --bg-chat-user: #26a69a;
  --bg-chat-ai: #2f2f2f;
  --text-primary: #ececec;
  --text-secondary: #b4b4b4;
  --border-color: #383838;
  --input-bg: #2f2f2f;
  --hover-color: #383838;
}

/* 全局背景色，防止深色模式切换时出现白边 */
body {
  margin: 0;
  background-color: var(--bg-primary);
  transition: background-color 0.3s;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.app-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: background-color 0.3s, color 0.3s;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 100;
}

.sidebar.collapsed {
  width: 0;
  border: none;
}

.sidebar-header {
  padding: 16px 12px;
  display: flex;
  gap: 8px;
}

.new-chat-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.new-chat-btn:hover {
  background-color: var(--hover-color);
}

.toggle-sidebar-btn {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
}

.toggle-sidebar-btn:hover {
  background-color: var(--hover-color);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background 0.2s;
  position: relative;
  color: var(--text-primary);
}

.session-item:hover {
  background-color: var(--hover-color);
}

.session-item.active {
  background-color: var(--hover-color);
}

.session-icon {
  margin-right: 12px;
  opacity: 0.7;
}

.session-title {
  flex: 1;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  opacity: 0;
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: var(--border-color);
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.user-profile-mini {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
}

.user-info-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-tools {
  display: flex;
  gap: 4px;
}

.tools-btn {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  padding: 6px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tools-btn:hover {
  background-color: var(--border-color);
}

.user-profile-mini:hover {
  background-color: var(--hover-color);
}

.avatar-circle {
  width: 32px;
  height: 32px;
  background: #ab68ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 0;
  background-color: var(--bg-primary);
}

.app-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-header);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.header-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.model-selector-container {
  flex: 0 1 auto;
  display: flex;
  justify-content: center;
  min-width: 0;
  margin: 0 8px;
}

.custom-selector {
  display: flex;
  align-items: center;
  background: var(--bg-chat-ai);
  padding: 4px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
  max-width: 100%;
  width: fit-content;
}

.custom-selector:hover {
  background: var(--hover-color);
  border-color: var(--border-color);
}

.selector-divider {
  margin: 0 6px;
  color: var(--text-secondary);
  font-weight: 300;
}

.minimal-select {
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  outline: none;
  padding: 4px;
  flex-shrink: 0;
}

.model-select {
  color: var(--text-primary);
  max-width: none;
  white-space: nowrap;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.header-action-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  color: var(--text-primary);
}

.header-action-btn:hover {
  background: var(--hover-color);
}

/* Chat Main Area */
.chat-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.messages-wrapper {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.message-row {
  display: flex;
  margin-bottom: 24px;
  width: 100%;
}

.message-row.user {
  justify-content: flex-end;
}

.message-container {
  display: flex;
  max-width: 85%;
  gap: 12px;
}

.message-row.user .message-container {
  flex-direction: row-reverse;
}

.avatar-box {
  flex-shrink: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.avatar.assistant {
  background: #10a37f;
  color: white;
}

.avatar.user {
  background: #ab68ff;
  color: white;
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
}

.message-row.user .message-content-wrapper {
  align-items: flex-end;
}

.role-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  margin-left: 4px;
}

.message-row.user .role-label {
  margin-left: 0;
  margin-right: 4px;
}

.message-content {
  position: relative;
}

.text-body {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.6;
  word-break: break-word;
}

.message-row.assistant .text-body {
  background-color: var(--bg-chat-ai);
  color: var(--text-primary);
  border-top-left-radius: 4px;
}

.message-row.user .text-body {
  background-color: var(--bg-chat-user);
  color: #000000;
  border-top-right-radius: 4px;
}

/* 深色模式下的用户气泡文字颜色 */
:root.dark .message-row.user .text-body {
  color: #ffffff;
}

/* Markdown Styles */
.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(pre) {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.markdown-content :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

/* Footer Styles */
.app-footer {
  padding: 20px;
  background-color: var(--bg-primary);
}

.input-container-outer {
  max-width: 800px;
  margin: 0 auto;
}

.input-container-inner {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 8px 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.attach-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  color: var(--text-secondary);
}

.attach-btn:hover {
  background: var(--hover-color);
}

textarea {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px;
  font-size: 1rem;
  resize: none;
  outline: none;
  color: var(--text-primary);
  max-height: 200px;
}

.send-icon-btn {
  background: #10a37f;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.send-icon-btn:disabled {
  background: var(--border-color);
  cursor: not-allowed;
}

.disclaimer {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 12px;
}

/* KaTeX support */
.markdown-content :deep(.katex-display) {
  margin: 1em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

/* Knowledge Center Modal Styles */
.knowledge-modal {
  max-width: 600px !important;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 10px;
}

.k-section h4 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
  border-bottom: 2px solid #10a37f;
  padding-bottom: 4px;
  display: inline-block;
}

.k-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.k-section li {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.k-section li::before {
  content: "•";
  color: #10a37f;
  font-weight: bold;
}

.knowledge-footer {
  margin-top: 24px;
  padding: 12px;
  background: var(--bg-chat-ai);
  border-radius: 8px;
  font-size: 0.85rem;
  color: #10a37f;
  font-weight: 600;
  text-align: center;
}

/* Thought Container Optimization */
.thought-container {
  margin: 12px 0;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.thought-summary {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  list-style: none;
  font-size: 0.9rem;
  color: var(--text-primary);
  user-select: none;
}

.thought-summary::-webkit-details-marker {
  display: none;
}

.thought-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thought-icon {
  font-size: 1.1rem;
}

.thought-badge {
  background: var(--border-color);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.thought-steps {
  padding: 0 14px 14px 14px;
  display: flex;
  flex-direction: column;
}

.thought-step {
  display: flex;
  gap: 12px;
  position: relative;
}

.step-line {
  width: 2px;
  background: var(--border-color);
  margin-left: 10px;
  flex-shrink: 0;
}

.thought-step:last-child .step-line {
  background: transparent;
}

.step-content {
  padding-bottom: 16px;
  flex: 1;
}

.step-header {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-num {
  background: var(--text-primary);
  color: var(--bg-primary);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.step-io {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  font-size: 0.8rem;
}

.io-box {
  margin-bottom: 4px;
}

.io-label {
  color: var(--text-secondary);
  font-weight: 600;
  margin-right: 6px;
}

.io-box.output {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-color);
}

.io-box pre {
  margin: 4px 0 0 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-primary);
}

.spinning {
  display: inline-block;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Typewriter Cursor */
.message-row.assistant .markdown-content > *:last-child::after {
  content: '';
  display: v-bind("loading || (currentHistory.length > 0 && currentHistory[currentHistory.length-1].loading) ? 'inline-block' : 'none'");
  width: 2px;
  height: 1.2em;
  background: var(--text-primary);
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}.header-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .header-action-btn {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    padding: 8px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .header-action-btn:hover {
    background: #f0f0f0;
  }

  /* Settings Styles */
  .settings-modal {
    max-width: 450px !important;
  }

  .settings-group {
    margin-bottom: 20px;
  }

  .settings-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #4a5568;
  }

  .settings-group input, .settings-group select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    outline: none;
  }

  .settings-group input:focus {
    border-color: #10a37f;
  }

  .settings-info {
    font-size: 0.85rem;
    color: #718096;
    background: #f7fafc;
    padding: 10px;
    border-radius: 6px;
    margin-top: 10px;
  }

  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
  }

  .save-btn {
    background: #10a37f;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .save-btn:hover {
    background: #0d8a6b;
  }

  /* Code Block Styles */
  .code-block-wrapper {
    position: relative;
    margin: 16px 0;
  }

  .copy-code-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    z-index: 5;
    transition: all 0.2s;
  }

  .copy-code-btn:hover {
    background: white;
    border-color: #10a37f;
    color: #10a37f;
  }

  .copy-code-btn.copied {
    background: #10a37f;
    color: white;
    border-color: #10a37f;
  }

  /* Floating Panel */
  .floating-config-panel {
  position: absolute;
  top: 70px;
  left: 20px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 50;
  width: 320px;
}

.floating-config-panel .detail-row {
  margin-bottom: 10px;
  font-size: 0.8rem;
}

.floating-config-panel label {
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
  color: #666;
}

.floating-config-panel code {
  background: #f4f4f4;
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
  display: block;
}

.close-panel {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
}

/* Chat Area */
.chat-main {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  background-color: #f5f5f5; /* 微信聊天背景色 */
}

.welcome-container {
  height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
  background-color: transparent;
}

.welcome-logo {
  font-size: 4rem;
  margin-bottom: 24px;
}

.welcome-container h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 40px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  width: 100%;
}

.action-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  background-color: #f9f9f9;
  border-color: #d1d1d1;
}

.action-icon {
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.action-text b {
  font-size: 0.95rem;
  display: block;
  margin-bottom: 4px;
}

.action-text p {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.messages-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 10px 120px;
}

.message-row {
  padding: 12px 20px;
  width: 100%;
  display: flex;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.assistant {
  justify-content: flex-start;
}

.message-container {
  display: flex;
  gap: 12px;
  max-width: 85%; /* 微信风格通常较宽 */
  align-items: flex-start;
}

.message-row.user .message-container {
  flex-direction: row;
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
}

.message-row.user .message-content-wrapper {
  align-items: flex-end;
}

.message-row.assistant .message-content-wrapper {
  align-items: flex-start;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px; /* 微信风格是小方块圆角 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: none;
}

.avatar.user {
  background-color: #f3f3f3;
}

.message-content {
  position: relative;
  margin-top: 4px;
}

.role-label {
  font-weight: 400;
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 4px;
}

.text-body {
  font-size: 1rem;
  line-height: 1.5;
  padding: 10px 14px;
  border-radius: 6px;
  word-break: break-all;
}

.text-body p {
  margin: 0; /* 移除段落默认边距，防止气泡撑得太大 */
}

.message-row.user .text-body {
  background: #95ec69; /* 微信绿 */
  color: #000;
  border: 1px solid #81d45c;
  margin-right: 8px; /* 留出空间给小尖角 */
}

.message-row.assistant .text-body {
  background: #ffffff;
  color: #000;
  border: 1px solid #ebebeb;
  margin-left: 8px; /* 留出空间给小尖角 */
}

/* 气泡小尖角模拟 */
.message-row.user .text-body::after {
  content: "";
  position: absolute;
  right: -7px;
  top: 12px;
  border-left: 8px solid #95ec69;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.message-row.assistant .text-body::after {
  content: "";
  position: absolute;
  left: -7px;
  top: 12px;
  border-right: 8px solid #ffffff;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.tag-row {
  margin-bottom: 12px;
}

.intent-tag {
  background: #f1f1f1;
  color: #666;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.markdown-content {
  white-space: pre-wrap;
}

.markdown-content :deep(pre) {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.markdown-content :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 85%;
  background: rgba(175, 184, 193, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 6px;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.markdown-content :deep(h1), .markdown-content :deep(h2) {
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 0.3em;
  margin-top: 24px;
  margin-bottom: 16px;
}

/* Thought Container Styles */
.thought-container {
  margin-bottom: 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.thought-summary {
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #6c757d;
  cursor: pointer;
  user-select: none;
  background: #fff;
  transition: background 0.2s;
}

.thought-summary:hover {
  background: #f1f3f5;
}

.thought-icon {
  margin-right: 6px;
}

.thought-steps {
  padding: 12px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  font-size: 0.8rem;
}

.thought-step {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #dee2e6;
}

.thought-step:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.step-header {
  font-weight: 600;
  color: #495057;
  margin-bottom: 6px;
}

.step-io {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.io-box {
  background: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 6px 10px;
}

.io-box pre {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #212529;
  white-space: pre-wrap;
}

.tool-expansion {
  margin-top: 16px;
}

.tool-expansion summary {
  font-size: 0.85rem;
  color: #10a37f;
  cursor: pointer;
  font-weight: 500;
}

.tool-expansion pre {
  background: #f7f7f8;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  margin-top: 8px;
  overflow-x: auto;
}

/* Footer & Input */
.app-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: 24px;
  background: linear-gradient(transparent, white 50%);
  pointer-events: none;
}

.input-container-outer {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  pointer-events: auto;
}

.input-container-inner {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  display: flex;
  align-items: flex-end;
  padding: 10px 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
}

.input-container-inner:focus-within {
  border-color: #10a37f;
  box-shadow: 0 4px 24px rgba(16, 163, 127, 0.12);
}

.attach-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.attach-btn:hover {
  background: #f4f4f4;
}

textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 10px 4px;
  font-size: 1rem;
  line-height: 1.5;
  max-height: 200px;
  background: transparent;
  color: #000000; /* 强制黑色文字，防止主题干扰 */
  min-height: 24px;
}

.send-icon-btn {
  background: #0d0d0d;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 4px;
  transition: opacity 0.2s;
}

.send-icon-btn:disabled {
  background: #e5e5e5;
  color: #acacac;
  cursor: not-allowed;
}

.disclaimer {
  text-align: center;
  font-size: 0.75rem;
  color: #999;
  margin-top: 12px;
}

/* Utilities */
.typing-dots {
  display: flex;
  gap: 4px;
  padding-top: 10px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #ddd;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #fecaca;
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  z-index: 100;
  color: #dc2626;
}

.close-toast {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(0);
  }
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
}

/* Prompt Library Styles */
.prompt-library-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.prompt-library-modal {
  background: white;
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-modal {
  background: #f5f5f5;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.close-modal:hover {
  background: #eeeeee;
  color: #000;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.library-toolbar {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-box input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #10a37f;
}

.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.cat-tab {
  padding: 6px 14px;
  background: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.cat-tab:hover {
  background: #eeeeee;
}

.cat-tab.active {
  background: #10a37f;
  color: white;
}

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.prompt-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
}

.prompt-card:hover {
  border-color: #10a37f;
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.08);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: 12px;
}

.card-category {
  display: inline-block;
  padding: 2px 8px;
  background: #e6f7f3;
  color: #10a37f;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.card-desc {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.5;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.use-btn {
  font-size: 0.8rem;
  font-weight: 600;
  color: #10a37f;
}
</style>