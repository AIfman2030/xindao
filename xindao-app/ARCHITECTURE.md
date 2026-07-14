# 心岛 App 架构设计文档

> 版本：v1.0 | 日期：2026-07-02 | 状态：MVP完成

---

## 一、项目愿景

**心岛** —— 一款AI陪伴社交App，通过蒸馏各领域智者的思维框架，为用户提供可落地的行动建议。

核心价值：释放焦虑，不再孤独

---

## 二、技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                               │
├─────────────────┬─────────────────┬──────────────────────────┤
│   Web (Vite+React)  │  微信小程序  │  iOS/Android (React Native) │
└────────┬────────────────┴───────┬─────┴──────────────────────┘
         │                         │
         └──────────┬──────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      API 网关层                              │
│                   (腾讯云API网关 / Nginx)                    │
└────────┬────────────────┬─────────────────────┬───────────┘
         │                │                     │
         ▼                ▼                     ▼
┌──────────────┐  ┌──────────────┐      ┌──────────────┐
│  用户服务     │  │  聊天服务    │      │  行动服务    │
│  (云函数)     │  │  (云函数)    │      │  (云函数)    │
└──────┬───────┘  └──────┬───────┘      └──────┬───────┘
       │                 │                     │
       └────────────────┼─────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │    腾讯云开发        │
              │  ┌───────────────┐  │
              │  │   数据库      │  │
              │  │  (用户/消息/  │  │
              │  │   行动/智者)  │  │
              │  └───────────────┘  │
              │  ┌───────────────┐  │
              │  │   存储        │  │
              │  │  (文件/图片)  │  │
              │  └───────────────┘  │
              └─────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │   AI 服务           │
              │  (OpenAI / Claude) │
              └─────────────────────┘
```

### 2.2 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| **Web端** | Vite + React 18 + TypeScript | 快速开发，热更新 |
| **小程序端** | 原生小程序 + Vant Weapp | 微信生态 |
| **移动端** | React Native / Flutter | 跨平台iOS/Android |
| **后端** | 腾讯云函数 (SCF) | 免服务器，弹性伸缩 |
| **数据库** | 腾讯云数据库 (MongoDB) | JSON友好，适合聊天数据 |
| **存储** | 腾讯云存储 (COS) | 头像、文件存储 |
| **AI** | OpenAI GPT-4 / Claude | 核心对话能力 |
| **推送** | 极光 / 微信小程序订阅消息 | 行动提醒 |

---

## 三、数据模型

### 3.1 用户表 (users)

```typescript
interface User {
  _id: ObjectId;
  nickname: string;           // 昵称
  bio: string;                 // 一句话介绍
  avatar: string;              // 头像URL
  selectedAdvisor: string;    // 当前智者ID
  advisors: string[];         // 已添加的智者列表
  openid?: string;            // 微信openid
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 智者表 (advisors)

```typescript
interface Advisor {
  _id: ObjectId;
  id: string;                 // naval / pg / feynman / zhang / mrbeast / custom_xxx
  name: string;
  nameEn: string;
  emoji: string;
  color: string;
  tags: string[];
  prompt: string;             // AI system prompt
  status: 'ready' | 'pending' | 'distilling';
  createdBy: 'system' | userId;
  createdAt: Date;
}
```

### 3.3 对话表 (conversations)

```typescript
interface Conversation {
  _id: ObjectId;
  userId: ObjectId;
  advisorId: string;
  messages: Message[];
  actionCard: ActionCard;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  createdAt: Date;
}

interface ActionCard {
  items: ActionItem[];
  createdAt: Date;
}

interface ActionItem {
  text: string;
  done: boolean;
  doneAt?: Date;
}
```

### 3.4 行动表 (actions)

```typescript
interface Action {
  _id: ObjectId;
  userId: ObjectId;
  text: string;
  source: 'auto' | 'manual';
  conversationId: ObjectId;
  advisorId: string;
  done: boolean;
  doneAt?: Date;
  reminderAt?: Date;           // 提醒时间
  createdAt: Date;
}
```

### 3.5 蒸馏任务表 (distill_tasks)

```typescript
interface DistillTask {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  tags: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;           // 0-100
  advisorId?: string;         // 完成后生成的智者ID
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

---

## 四、API 设计

### 4.1 认证

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/auth/login` | POST | 微信登录 |
| `/api/auth/logout` | POST | 退出登录 |
| `/api/auth/refresh` | POST | 刷新Token |

### 4.2 用户

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/user/profile` | GET | 获取用户信息 |
| `/api/user/profile` | PUT | 更新用户信息 |
| `/api/user/advisor` | POST | 选择/切换智者 |
| `/api/user/advisors` | GET | 获取用户的所有智者 |

### 4.3 对话

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/chat/send` | POST | 发送消息 |
| `/api/chat/history` | GET | 获取历史消息 |
| `/api/chat/action-card` | GET | 获取当前行动卡 |

### 4.4 行动

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/actions/today` | GET | 获取今日行动 |
| `/api/actions/complete` | POST | 标记完成 |
| `/api/actions/stats` | GET | 获取统计数据 |
| `/api/actions/remind` | POST | 设置提醒 |

### 4.5 蒸馏

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/distill/start` | POST | 开始蒸馏 |
| `/api/distill/status` | GET | 查询蒸馏状态 |
| `/api/distill/cancel` | POST | 取消蒸馏 |

---

## 五、项目结构

```
xindao-app/
├── web/                      # Web端 (Vite + React)
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/            # 页面
│   │   ├── stores/           # 状态管理 (Zustand)
│   │   ├── services/         # API服务
│   │   ├── hooks/            # 自定义Hooks
│   │   ├── utils/            # 工具函数
│   │   └── styles/           # 全局样式
│   ├── public/
│   └── index.html
│
├── mini-program/            # 微信小程序
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── app.js
│
├── server/                   # 云函数 (可选，腾讯云SCF)
│   ├── auth/
│   ├── chat/
│   ├── actions/
│   ├── distill/
│   └── utils/
│
├── skills/                   # 智者Skill库 (基于女娲Skill格式)
│   ├── naval.md
│   ├── pg.md
│   ├── feynman.md
│   ├── zhangyiming.md
│   └── steve-jobs.md
│
└── shared/                   # 共享类型和工具
    ├── types/
    └── constants/
```

---

## 六、Skill 格式设计

基于 `.agents/skills/steve-jobs-perspective/SKILL.md` 的经验，设计心岛的智者Skill：

```markdown
---
name: naval-perspective
description: Naval Ravikant的思维框架与表达方式...
---

# Naval · 财富与幸福哲学

## 身份规则
- 直接以Naval身份回应
- 用「我」而非「Naval会认为...」
- 简洁有力，直击要害

## System Prompt
你是Naval Ravikant，一位印度裔美国投资人...

## 核心心智模型
### 1. 聚焦即说不
...

### 2. 财富公式
...

## 表达DNA
- 短句为主
- 善用比喻
- 强调选择和心态
...

## 诚实边界
...
```

---

## 七、蒸馏流程设计

```
用户输入人名 → 选择标签 → 确认蒸馏
      │
      ▼
┌─────────────────────────────────┐
│      Step 1: 深度调研 (30%)      │
│  - WebSearch 搜索公开信息        │
│  - 提取著作/言论/访谈            │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│    Step 2: 思维框架提炼 (60%)    │
│  - 分析决策模式                  │
│  - 提取核心心智模型              │
│  - 生成决策启发式               │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│    Step 3: Skill生成 (90%)       │
│  - 编写system prompt            │
│  - 生成表达DNA                  │
│  - 定义边界和局限               │
└─────────────────────────────────┘
      │
      ▼
    新智者加入
```

---

## 八、行动提醒设计

### 8.1 提醒触发逻辑

```typescript
// 伪代码
function scheduleReminders(actions: Action[]) {
  for (const action of actions) {
    if (action.reminderAt) {
      // 使用定时任务或消息队列
      scheduleJob(action.id, action.reminderAt, () => {
        sendReminderNotification(action);
      });
    }
  }
}
```

### 8.2 推送渠道

| 渠道 | 适用场景 |
|------|---------|
| 微信订阅消息 | 小程序用户，必须先订阅 |
| 极光推送 | App用户，需要授权 |
| 站内通知 | 所有用户，实时性强 |

---

## 九、里程碑

| 日期 | 里程碑 | 交付物 |
|------|--------|--------|
| Week 1 | MVP完成 | Web版可用，基本聊天功能 |
| Week 2 | 小程序版 | 微信小程序上线 |
| Week 3 | 行动系统完善 | 提醒功能，统计数据 |
| Week 4 | Skill库扩展 | 更多智者，更丰富的对话 |
| Week 5-6 | App版 | iOS/Android应用 |
| Week 7-8 | 蒸馏功能 | 用户可自定义创建智者 |

---

## 十、建议与改进

### 10.1 产品方向

1. **差异化定位**：目前市场上有太多AI聊天产品，心岛的差异化在于"行动导向"——不只是聊天，而是真正帮助用户落地执行
2. **社群运营**：可以加入"同好群"功能，让同一位智者的用户互相交流
3. **游戏化**：增加连续打卡、成就系统等，提升用户粘性

### 10.2 技术方向

1. **Skill标准化**：将现有的Skill格式统一，方便未来扩展更多智者
2. **RAG应用**：蒸馏新智者时，可以将相关文档向量化，实现更精准的回复
3. **多模态**：未来可以支持语音输入输出，甚至视频形象

### 10.3 商业化

1. ** Freemium模式**：基础功能免费，高级智者或高级功能付费
2. **企业版**：为团队/公司提供定制化智者服务
3. **Skill市场**：用户可以分享自己创建的Skill，形成生态

---

## 十一、参考案例

| 项目 | 参考点 | 链接 |
|------|--------|------|
| steve-jobs-perspective Skill | Skill格式设计 | `../.agents/skills/steve-jobs-perspective/` |
| Character.AI | 角色AI对话 | character.ai |
| Replika | AI陪伴 | replika.com |

---

**文档结束**