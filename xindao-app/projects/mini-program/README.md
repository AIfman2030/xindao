# 心岛 App - 小程序开发包

> 快速验证版本 MVP v1.0

## 目录结构

```
mini-program/
├── app.js              # 全局入口
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── pages/
│   ├── splash/         # 启动页
│   ├── onboarding/     # 引导页
│   ├── auth/           # 登录注册
│   ├── choose-advisor/ # 选择智者
│   ├── chat/           # 聊天页 ⭐
│   ├── today/          # 今日页
│   ├── progress/       # 进度页
│   ├── profile/        # 我的页
│   └── distill/        # 蒸馏页
├── components/         # 组件
├── utils/              # 工具
├── services/           # API服务
└── assets/             # 静态资源
```

## 已完成页面

| 页面 | 状态 | 说明 |
|------|------|------|
| splash | ✅ | 启动页 + 呼吸动画 |
| chat | ✅ | 聊天界面 + 行动卡 + 语音 |
| progress | ✅ | 进度追踪（圆环 + 连续天数）|

## 待完成页面

| 页面 | 说明 |
|------|------|
| onboarding | 3页引导 |
| auth | 昵称注册 |
| choose-advisor | 选择智者卡片 |
| today | 今日任务 |
| profile | 个人中心 |
| distill | 蒸馏新人 |

## 设计规范

```
主色: #FF9A76 (珊瑚橙)
主色深: #FF7E5F
背景: #FFF8F3
卡片: #FFFFFF
文字主: #5D4E45
文字次: #8B7B6B
边框: #F5EDE6
```

## 运行方式

1. 下载微信开发者工具
2. 导入 `mini-program` 目录
3. 设置 AppID（测试号即可）
4. 编译运行

## 下一步

1. 完成剩余页面
2. 对接后端API
3. 集成Skill引擎
4. 提交审核

---

**PRD文档**: `PRD.md`
**设计稿**: `design-demos/xindao-app-prototype-v5-complete.html`