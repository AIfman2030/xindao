# 心岛 App 功能完善计划

## 用户需求
- 注册后与智者一对一聊天
- 创建群组就具体话题讨论，智者给出建议
- 用户确认建议后自动生成执行清单
- 每天通过邮件提醒执行
- 支持继续问答
- 支持用户自定义蒸馏其他智者（使用 /huashu-nuwa skill）
- 一键导出所有想法和执行效果

---

## 技术方案
- **框架**: Next.js 全栈（App Router）
- **数据库**: SQLite + Prisma（本地文件存储）
- **邮件**: Nodemailer（可配置SMTP）
- **蒸馏**: 集成 huashu-nuwa skill

---

## 实现步骤

### Phase 1: Next.js 项目基础搭建
1. 创建 Next.js 项目结构
2. 配置 Prisma + SQLite 数据库
3. 设计数据模型（User, Advisor, Conversation, Message, Action, Group）

### Phase 2: 用户注册与智者选择
1. 注册页面（昵称 + bio）
2. 智者选择界面
3. 用户状态管理

### Phase 3: 一对一聊天功能
1. 聊天界面 UI
2. AI 回复（使用 OpenAI API）
3. 自动生成行动卡

### Phase 4: 群组聊天的功能
1. 创建群组（输入话题）
2. 邀请多个智者加入群组
3. 群组内多智者分别给出建议
4. 用户确认建议 → 生成执行清单

### Phase 5: 行动清单与邮件提醒
1. 行动清单展示（可勾选完成）
2. 邮件提醒系统（Nodemailer + 定时任务）
3. 每日提醒配置

### Phase 6: 蒸馏功能
1. 蒸馏页面 UI
2. 集成 huashu-nuwa skill 流程
3. 新智者生成与保存

### Phase 7: 数据导出
1. 一键导出功能（JSON/Markdown格式）
2. 包含所有对话、行动记录

---

## 数据模型

```prisma
model User {
  id        String   @id @default(cuid())
  nickname  String
  bio       String?
  advisors  Advisor[]
  groups    Group[]
  actions   Action[]
  createdAt DateTime @default(now())
}

model Advisor {
  id        String   @id @default(cuid())
  name      String
  emoji     String
  color     String
  tags      String
  prompt    String
  isCustom  Boolean  @default(false)
  users     User[]
  groups    GroupAdvisor[]
}

model Group {
  id        String   @id @default(cuid())
  topic     String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  advisors  GroupAdvisor[]
  messages  Message[]
  actions   Action[]
  createdAt DateTime @default(now())
}

model GroupAdvisor {
  id        String   @id @default(cuid())
  groupId   String
  group     Group    @relation(fields: [groupId], references: [id])
  advisorId String
  advisor   Advisor  @relation(fields: [advisorId], references: [id])
}

model Message {
  id        String   @id @default(cuid())
  role      String   // user / ai
  content   String
  advisorId String?
  groupId   String?
  group     Group?   @relation(fields: [groupId], references: [id])
  createdAt DateTime @default(now())
}

model Action {
  id        String   @id @default(cuid())
  text      String
  done      Boolean  @default(false)
  doneAt    DateTime?
  reminderAt DateTime?
  groupId   String?
  group     Group?   @relation(fields: [groupId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

---

## 预计文件结构

```
xindao-app/
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # 启动页
│   │   │   ├── register/page.tsx      # 注册页
│   │   │   ├── chat/page.tsx          # 一对一聊天
│   │   │   ├── group/page.tsx         # 群组聊天
│   │   │   ├── actions/page.tsx       # 行动清单
│   │   │   ├── distill/page.tsx       # 蒸馏功能
│   │   │   └── api/                   # API 路由
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
```

---

## 实施顺序

1. ✅ 项目初始化（Next.js + Prisma）
2. 注册/登录流程
3. 一对一聊天
4. 群组聊天
5. 行动卡生成与展示
6. 邮件提醒
7. 蒸馏功能
8. 数据导出

---

需要确认是否按此计划执行。