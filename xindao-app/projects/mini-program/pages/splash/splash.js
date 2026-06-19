// pages/splash/splash.js
const app = getApp()

Page({
  data: {
    logoScale: 1,
  },

  onLoad() {
    // 呼吸动画
    this.breatheAnimation()
  },

  // 呼吸动画
  breatheAnimation() {
    const animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease-in-out',
    })

    let scale = 1
    let growing = true

    const animate = () => {
      if (growing) {
        scale += 0.02
        if (scale >= 1.05) growing = false
      } else {
        scale -= 0.02
        if (scale <= 1) growing = true
      }

      animation.scale(scale).step()

      this.setData({
        logoAnimation: animation.export()
      })

      setTimeout(animate, 50)
    }

    animate()
  },

  // 点击开始探索
  onStartTap() {
    // 判断是否已登录
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')

    if (token && userInfo) {
      // 已登录 → 进入主页
      wx.switchTab({
        url: '/pages/chat/chat'
      })
    } else {
      // 未登录 → 进入引导页
      wx.redirectTo({
        url: '/pages/onboarding/onboarding'
      })
    }
  },

  // 点击登录
  onLoginTap() {
    wx.redirectTo({
      url: '/pages/auth/auth?type=login'
    })
  }
})