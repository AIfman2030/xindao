// pages/chat/chat.js
const app = getApp()

Page({
  data: {
    // 当前智者
    advisor: null,
    // 消息列表
    messages: [],
    // 输入内容
    inputValue: '',
    // 是否录音中
    isRecording: false,
    // 是否生成行动卡
    actionCard: null,
    // 打字中状态
    isTyping: false,
  },

  onLoad() {
    // 获取当前智者
    const advisor = app.globalData.selectedAdvisor
    if (advisor) {
      this.setData({ advisor })
    } else {
      // 默认Naval
      const defaultAdvisor = app.globalData.defaultAdvisors[0]
      this.setData({ advisor: defaultAdvisor })
      app.selectAdvisor('naval')
    }

    // 加载欢迎横幅
    this.showWelcomeBanner()
  },

  // 显示欢迎横幅
  showWelcomeBanner() {
    const userInfo = app.globalData.userInfo || {}
    const advisor = this.data.advisor
    const nickname = userInfo.nickname || '新朋友'

    this.setData({
      messages: [{
        id: 'welcome',
        type: 'welcome',
        content: `Hi ${nickname}，欢迎来到心岛\n\n你的专属智者 ${advisor.name} 已就位。无论生活、工作还是感情上的困惑，都可以和他聊聊。`,
        created_at: Date.now()
      }]
    })
  },

  // 监听输入
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  // 发送消息
  onSendMessage() {
    const content = this.data.inputValue.trim()
    if (!content) return

    const userInfo = app.globalData.userInfo || {}
    const newMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      role: 'user',
      content,
      sender: userInfo.nickname || '我',
      created_at: Date.now()
    }

    // 添加用户消息
    this.setData({
      messages: [...this.data.messages, newMessage],
      inputValue: '',
      isTyping: true
    })

    // 模拟AI回复（后续替换为真实Skill调用）
    setTimeout(() => {
      this.generateAIResponse(content)
    }, 1500)
  },

  // 生成AI回复（使用心智模型）
  generateAIResponse(userQuestion) {
    const advisor = this.data.advisor

    // 预设回复模板（后续从Skill文件读取）
    const responses = this.getAdvisorsResponses(advisor.id)

    const aiMessage = {
      id: `ai_${Date.now()}`,
      type: 'ai',
      role: 'ai',
      content: responses[Math.floor(Math.random() * responses.length)],
      sender: advisor.name,
      avatar_emoji: advisor.avatar_emoji,
      avatar_color: advisor.avatar_color,
      created_at: Date.now()
    }

    // 添加AI消息
    this.setData({
      messages: [...this.data.messages, aiMessage],
      isTyping: false
    })

    // 生成行动卡
    this.generateActionCard()
  },

  // 获取智者回复模板
  getAdvisorsResponses(advisorId) {
    const templates = {
      naval: [
        '你列了三个欲望。每个欲望都是你跟不快乐签的一份合同。不是精力不够，是合同太多。问你自己：哪一个做起来你会忘记时间？那个就是你的特定知识所在。',
        '欲望等于恐惧。你有多想要它，就有多怕失去它。问自己：如果失败了你还能活下去吗？如果能，就去。',
        '时间是你最宝贵的资源。金钱可以赚，时间不能。把你醒着的每一小时都投资在能让你更接近目标的事情上。'
      ],
      pg: [
        '写作是思考的工具，不是结果的展示。先开始写，不管好不好。写得多了，自然就好 了。',
        '最好的工作是你愿意免费做的工作。如果你找到了，就不要停下来。',
        '创业的本质是制造别人想要的东西。不是制造你喜欢的东西，是制造别人愿意付钱的东西。'
      ],
      feyman: [
        '我不能创造一个想法，我只是发现了它。如果你不能简单地解释它，你就没有真正理解它。',
        '科学是不确定性的艺术。承认不知道比假装知道要好得多。',
        '犯错误的唯一方法是不尝试新事物。保持好奇，保持怀疑。'
      ],
      zhangyiming: [
        '平庸有重力，需要逃逸速度。做到极致需要的是不满足，持续不满足。',
        '信息的分发效率是核心。我们做的所有事情都是为了让对的人看到对的内容。',
        '延迟满足是一种能力，也是一种选择。选择延迟满足的人，往往能走得更远。'
      ],
      mrbeast: [
        '内容创作的核心是注意力。如果你的视频不能在3秒内抓住眼球，后面再好也没人看。',
        '测试，迭代，再测试。没有哪个视频第一版就是完美的，不断优化才是王道。',
        '做人们真正想看的内容，不是你觉得他们应该看的内容。数据会告诉你真相。'
      ]
    }
    return templates[advisorId] || templates.naval
  },

  // 生成行动卡
  generateActionCard() {
    const actionItems = this.getActionItems()

    this.setData({
      actionCard: {
        id: `action_${Date.now()}`,
        items: actionItems,
        created_at: Date.now()
      }
    })
  },

  // 获取行动项
  getActionItems() {
    return [
      { id: 1, text: '列出本周最重要的3件事', time: '今天 09:00', done: false },
      { id: 2, text: '今天只做第1件事，其他说"不"', time: '今天', done: false },
      { id: 3, text: '晚8点回顾：哪个瞬间忘记了时间？', time: '20:00', done: false }
    ]
  },

  // 切换行动项完成状态
  onToggleAction(e) {
    const index = e.currentTarget.dataset.index
    const actionCard = this.data.actionCard
    const items = [...actionCard.items]
    items[index].done = !items[index].done

    this.setData({
      'actionCard.items': items
    })

    // 如果全部完成，更新进度
    const allDone = items.every(item => item.done)
    if (allDone) {
      wx.showToast({
        title: '太棒了！任务完成 🎉',
        icon: 'success'
      })
    }
  },

  // 开始录音
  onStartRecord() {
    wx.showToast({
      title: '开始录音',
      icon: 'none',
      duration: 1000
    })
    this.setData({ isRecording: true })
  },

  // 结束录音
  onEndRecord() {
    this.setData({ isRecording: false })

    // 模拟语音转文字
    const mockText = '最近工作压力很大，不知道怎么规划时间'
    this.setData({ inputValue: mockText })

    // 自动发送
    setTimeout(() => {
      this.onSendMessage()
    }, 500)
  },

  // 跳转到今日页
  onGotoToday() {
    wx.switchTab({
      url: '/pages/today/today'
    })
  }
})