# 心岛 App

> AI陪伴社交App，通过蒸馏各领域智者的思维框架，为用户提供可落地的行动建议。

## 功能特性

- ✅ **用户注册** - 昵称 + 选择专属智者
- ✅ **一对一聊天** - 与智者文字对话，获得建议
- ✅ **群组讨论** - 邀请多位智者同时回答同一问题
- ✅ **行动卡生成** - 对话后自动生成可执行任务清单
- ✅ **进度追踪** - 任务完成率、连续天数统计
- ✅ **邮件提醒** - 每日发送待办事项提醒
- ✅ **蒸馏新智者** - 自定义创建新的AI智者角色
- ✅ **数据导出** - 支持 JSON/Markdown 格式导出

## 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: SQLite + Prisma
- **AI**: OpenAI GPT-4 (可选，支持Mock模式)
- **邮件**: Nodemailer

## 快速开始

### 1. 安装依赖

```bash
cd xindao-app/web
npm install
```

### 2. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入你的配置
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

## 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `OPENAI_API_KEY` | 否 | OpenAI API Key，不填则使用Mock回复 |
| `SMTP_HOST` | 否 | 邮件SMTP服务器 |
| `SMTP_PORT` | 否 | SMTP端口 |
| `SMTP_USER` | 否 | 邮件用户名 |
| `SMTP_PASS` | 否 | 邮件密码 |
| `NEXT_PUBLIC_BASE_URL` | 否 | 站点URL，用于邮件链接 |

## 页面说明

- `/` - 启动页
- `/register` - 用户注册
- `/chat` - 一对一聊天
- `/group` - 群组列表
- `/group/[id]` - 群组聊天
- `/actions` - 行动清单与进度
- `/distill` - 蒸馏新智者
- `/settings` - 设置

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth` | POST | 用户注册 |
| `/api/advisors` | GET | 获取智者列表 |
| `/api/user/advisor` | POST | 选择/切换智者 |
| `/api/chat` | POST | 发送消息 |
| `/api/groups` | POST/GET | 创建/获取群组 |
| `/api/group/chat` | POST | 群组聊天（多智者响应） |
| `/api/actions` | GET | 获取行动清单 |
| `/api/actions/[id]` | POST | 更新行动状态 |
| `/api/distill` | POST | 蒸馏新智者 |
| `/api/export` | GET | 导出数据 |
| `/api/cron/reminder` | GET | 邮件提醒定时任务 |

## 设计规范

- **主题色**: #FF9A76 (橙珊瑚)
- **背景色**: #FFF8F3 (暖白)
- **文字色**: #5D4E45 (深棕)
- **字体**: Noto Serif SC (标题) + Noto Sans SC (正文)

## License

MIT