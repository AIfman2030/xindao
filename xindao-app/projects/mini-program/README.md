# 心岛 App - 微信小程序

> ⚠️ **重要更新**：心岛 App 已完成 Web 版本开发（Week 1-8），小程序是可选的后续平台。

## 状态

- **Web 版本**：✅ 已完成，功能完整
- **小程序版本**：🔄 开发中（基于原有 MVP 代码）

## 快速开始

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `mini-program` 目录
3. 设置 AppID（使用测试号或正式账号）
4. 编译运行

## 已完成页面

| 页面 | 状态 | 说明 |
|------|------|------|
| splash | ✅ | 启动页 + 呼吸动画 |
| chat | ✅ | 聊天界面 + 行动卡 |
| progress | ✅ | 进度追踪（圆环 + 连续天数）|

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

## 小程序适配指南

### 核心 API 映射

| Web 功能 | 小程序 API |
|---------|-----------|
| 设备ID | `wx.login()` 获取 OpenID |
| 浏览器通知 | `wx.requestSubscribeMessage()` |
| API 请求 | `wx.request()` |
| 存储 | `wx.getStorageSync()` |

### 需要适配的文件

1. **认证**：改用 `wx.login()` 获取用户标识
2. **通知**：使用 `wx.requestSubscribeMessage()` 替代浏览器通知
3. **请求**：将 `fetch` 改为 `wx.request()`
4. **样式**：微信特殊的 rpx 单位

### 示例代码

```javascript
// 小程序获取用户标识
wx.login({
  success: (res) => {
    if (res.code) {
      // 发送 code 到后端换取 openid
    }
  }
});

// 小程序订阅消息
wx.requestSubscribeMessage({
  tmplIds: ['your_template_id'],
  success: (res) => {
    console.log('订阅结果:', res);
  }
});
```

## 后续计划

1. 完善剩余页面（onboarding、profile 等）
2. 对接 Web 后端 API（`localhost:3001`）
3. 集成 OpenAI 流式对话
4. 提交微信审核

## 相关资源

- [Web 版本入口](../web/index.html)
- [后端服务](../server/README.md)
- [架构文档](../../ARCHITECTURE.md)