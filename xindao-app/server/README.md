# 心岛 App 后端服务

> F1.1: 真实 AI 对话引擎

## 快速开始

### 1. 安装依赖

```bash
cd xindao-app/server
npm install
```

### 2. 启动服务

```bash
npm start
# 或开发模式（自动重启）
npm run dev
```

服务将运行在 `http://localhost:3001`

### 3. 测试

```bash
# 健康检查
curl http://localhost:3001/api/health

# 获取智者列表
curl http://localhost:3001/api/advisors

# 聊天（需要 curl 7.67.0+）
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "你好"}],
    "advisorId": "naval"
  }'
```

## API 接口

### POST /api/chat

发送消息给 AI 智者，支持流式响应（SSE）。

**请求体：**
```json
{
  "messages": [
    {"role": "user", "content": "你好"}
  ],
  "advisorId": "naval",
  "apiKey": "sk-xxx"  // 可选，使用用户自己的 API Key
}
```

**响应：** 流式 SSE
```
data: {"content": "你"}
data: {"content": "好"}
data: [DONE]
```

### GET /api/advisors

获取所有可用智者列表。

### GET /api/health

健康检查接口。

## 智者列表

| ID | 名称 | 标签 |
|----|------|------|
| naval | Naval Ravikant | 财富、幸福、人生哲学 |
| pg | 保罗·格雷厄姆 | 创业、职场、写作 |
| feynman | 理查德·费曼 | 学习、科学思维 |
| zhang | 张一鸣 | 产品、全球化 |
| mrbeast | MrBeast | 内容创作、流量 |

## 使用用户自己的 API Key

如果用户在前端配置了自己的 OpenAI API Key，请求会通过后端转发到 OpenAI：

```javascript
// 前端设置
localStorage.setItem('xindao_api_key', 'sk-xxx');
```

后端会将 Key 转发给 OpenAI，实现：
- 用户自己付费
- 无需暴露前端 API 调用
- 支持流式响应

## Mock 模式

如果未提供 API Key，服务会返回模拟回复，支持打字机效果。

## 技术栈

- Express.js - 轻量后端框架
- Server-Sent Events (SSE) - 流式响应
- Node.js 原生 fetch - 调用 OpenAI API

## 相关文档

- [心岛 App 架构文档](../ARCHITECTURE.md)
- [开发计划](../../DEVELOPMENT_PLAN.md)
- [项目过程文档](../../PROJECT_PROCESS.md)