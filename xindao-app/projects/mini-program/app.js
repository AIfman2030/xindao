// 心岛 App 入口文件
App({
  globalData: {
    userInfo: null,
    selectedAdvisor: null,
    advisors: [],
    token: null,
    // 预设智者数据
    defaultAdvisors: [
      {
        id: 'naval',
        name: 'Naval',
        name_cn: 'Naval',
        avatar_emoji: '🌊',
        avatar_color: '#FFE4D6',
        tags: ['财富', '幸福', '人生哲学'],
        status: 'ready',
        skill_md: 'naval-perspective'
      },
      {
        id: 'pg',
        name: '保罗·格雷厄姆',
        name_cn: 'PG',
        avatar_emoji: '💼',
        avatar_color: '#D6E8F0',
        tags: ['创业', '职场', '写作'],
        status: 'ready',
        skill_md: 'paul-graham-perspective'
      },
      {
        id: 'feynman',
        name: '费曼',
        name_cn: '费曼',
        avatar_emoji: '🔬',
        avatar_color: '#E8DFF0',
        tags: ['学习', '科学思维'],
        status: 'ready',
        skill_md: 'feynman-perspective'
      },
      {
        id: 'zhangyiming',
        name: '张一鸣',
        name_cn: '张一鸣',
        avatar_emoji: '📱',
        avatar_color: '#DFF0E8',
        tags: ['产品', '全球化'],
        status: 'ready',
        skill_md: 'zhang-yiming-perspective'
      },
      {
        id: 'mrbeast',
        name: 'MrBeast',
        name_cn: 'MrBeast',
        avatar_emoji: '🎬',
        avatar_color: '#F0EBD6',
        tags: ['内容创作', '流量'],
        status: 'ready',
        skill_md: 'mrbeast-perspective'
      }
    ]
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')

    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      this.globalData.selectedAdvisor = wx.getStorageSync('selectedAdvisor')
    }

    // 获取已添加的智者
    const advisors = wx.getStorageSync('advisors')
    if (advisors) {
      this.globalData.advisors = advisors
    } else {
      this.globalData.advisors = this.globalData.defaultAdvisors
    }
  },

  // 选择智者
  selectAdvisor(advisorId) {
    const advisor = this.globalData.advisors.find(a => a.id === advisorId)
    if (advisor) {
      this.globalData.selectedAdvisor = advisor
      wx.setStorageSync('selectedAdvisor', advisor)
    }
  },

  // 添加新智者
  addAdvisor(advisor) {
    const exists = this.globalData.advisors.find(a => a.id === advisor.id)
    if (!exists) {
      this.globalData.advisors.push(advisor)
      wx.setStorageSync('advisors', this.globalData.advisors)
    }
  },

  // 保存用户信息
  saveUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  // 保存Token
  saveToken(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null
    this.globalData.token = null
    this.globalData.selectedAdvisor = null
    wx.clearStorageSync()
  }
})