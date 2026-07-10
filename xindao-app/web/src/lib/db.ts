// Simple JSON file-based database
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

interface DBData {
  users: any[]
  advisors: any[]
  userAdvisors: any[]
  groups: any[]
  groupAdvisors: any[]
  messages: any[]
  actions: any[]
  distillTasks: any[]
}

const defaultDB: DBData = {
  users: [],
  advisors: [
    { id: 'naval', name: 'Naval', nameEn: 'Naval Ravikant', emoji: '🌊', color: '#FFE4D6', tags: '["财富","幸福","人生哲学"]', prompt: '你是Naval Ravikant，简洁有力，直击要害，善用比喻，强调选择和心态。回复不超过150字。', isCustom: false, status: 'ready' },
    { id: 'pg', name: '保罗·格雷厄姆', nameEn: 'Paul Graham', emoji: '💼', color: '#D6E8F0', tags: '["创业","职场","写作"]', prompt: '你是保罗·格雷厄姆，逻辑严密，善于分析，鼓励创业，重视写作和表达能力，务实直接。回复不超过150字。', isCustom: false, status: 'ready' },
    { id: 'feynman', name: '费曼', nameEn: 'Richard Feynman', emoji: '🔬', color: '#E8DFF0', tags: '["学习","科学思维"]', prompt: '你是理查德·费曼，化繁为简，幽默风趣，用简单语言解释复杂问题，鼓励动手实践和好奇心。回复不超过150字。', isCustom: false, status: 'ready' },
    { id: 'zhang', name: '张一鸣', nameEn: 'Zhang Yiming', emoji: '📱', color: '#DFF0E8', tags: '["产品","全球化"]', prompt: '你是张一鸣，数据驱动，理性决策，追求极致效率和执行力，低调务实。回复不超过150字。', isCustom: false, status: 'ready' },
    { id: 'mrbeast', name: 'MrBeast', nameEn: 'Jimmy Donaldson', emoji: '🎬', color: '#F0EBD6', tags: '["内容创作","流量"]', prompt: '你是MrBeast，充满激情和正能量，敢于做别人不敢做的事，幽默接地气。回复不超过150字。', isCustom: false, status: 'ready' },
  ],
  userAdvisors: [],
  groups: [],
  groupAdvisors: [],
  messages: [],
  actions: [],
  distillTasks: [],
}

function ensureDir() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function readDB(): DBData {
  ensureDir()
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2))
    return defaultDB
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
}

function writeDB(data: DBData) {
  ensureDir()
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export function db() {
  return {
    // Users
    createUser: (user: any) => {
      const data = readDB()
      user.id = 'user_' + Date.now()
      user.createdAt = new Date().toISOString()
      data.users.push(user)
      writeDB(data)
      return user
    },
    getUser: (id: string) => readDB().users.find(u => u.id === id),
    getUserByEmail: (email: string) => readDB().users.find(u => u.email === email),

    // Advisors
    getAdvisors: () => readDB().advisors.filter(a => a.status === 'ready'),
    getAdvisor: (id: string) => readDB().advisors.find(a => a.id === id),
    createAdvisor: (advisor: any) => {
      const data = readDB()
      advisor.id = 'adv_' + Date.now()
      advisor.createdAt = new Date().toISOString()
      data.advisors.push(advisor)
      writeDB(data)
      return advisor
    },

    // User Advisors
    addUserAdvisor: (userId: string, advisorId: string, isPrimary = false) => {
      const data = readDB()
      const existing = data.userAdvisors.find(ua => ua.userId === userId && ua.advisorId === advisorId)
      if (!existing) {
        data.userAdvisors.push({ id: 'ua_' + Date.now(), userId, advisorId, isPrimary, createdAt: new Date().toISOString() })
        writeDB(data)
      }
    },
    getUserPrimaryAdvisor: (userId: string) => {
      const data = readDB()
      const ua = data.userAdvisors.find(ua => ua.userId === userId && ua.isPrimary)
      if (ua) return data.advisors.find(a => a.id === ua.advisorId)
      const first = data.userAdvisors.find(ua => ua.userId === userId)
      if (first) return data.advisors.find(a => a.id === first.advisorId)
      return data.advisors[0]
    },

    // Groups
    createGroup: (group: any) => {
      const data = readDB()
      group.id = 'grp_' + Date.now()
      group.createdAt = new Date().toISOString()
      group.status = 'active'
      data.groups.push(group)
      writeDB(data)
      return group
    },
    getGroups: (userId: string) => {
      const data = readDB()
      return data.groups.filter(g => g.userId === userId).map(g => ({
        ...g,
        advisors: data.groupAdvisors.filter(ga => ga.groupId === g.id).map(ga => ({
          advisor: data.advisors.find(a => a.id === ga.advisorId)
        })),
        _count: { messages: data.messages.filter(m => m.groupId === g.id).length }
      }))
    },
    getGroup: (id: string) => {
      const data = readDB()
      const g = data.groups.find(g => g.id === id)
      if (!g) return null
      return {
        ...g,
        advisors: data.groupAdvisors.filter(ga => ga.groupId === g.id).map(ga => ({
          advisor: data.advisors.find(a => a.id === ga.advisorId)
        }))
      }
    },

    // Messages
    createMessage: (msg: any) => {
      const data = readDB()
      msg.id = 'msg_' + Date.now()
      msg.createdAt = new Date().toISOString()
      data.messages.push(msg)
      writeDB(data)
      return msg
    },
    getMessages: (groupId?: string) => {
      const data = readDB()
      let msgs = data.messages
      if (groupId) msgs = msgs.filter(m => m.groupId === groupId)
      return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    },

    // Actions
    createAction: (action: any) => {
      const data = readDB()
      action.id = 'act_' + Date.now()
      action.done = false
      action.createdAt = new Date().toISOString()
      data.actions.push(action)
      writeDB(data)
      return action
    },
    getActions: (userId: string) => {
      const data = readDB()
      return data.actions.filter(a => a.userId === userId).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    },
    updateAction: (id: string, updates: any) => {
      const data = readDB()
      const idx = data.actions.findIndex(a => a.id === id)
      if (idx >= 0) {
        data.actions[idx] = { ...data.actions[idx], ...updates }
        writeDB(data)
        return data.actions[idx]
      }
      return null
    },

    // Distill Tasks
    createDistillTask: (task: any) => {
      const data = readDB()
      task.id = 'dtask_' + Date.now()
      task.createdAt = new Date().toISOString()
      data.distillTasks.push(task)
      writeDB(data)
      return task
    },
    updateDistillTask: (id: string, updates: any) => {
      const data = readDB()
      const idx = data.distillTasks.findIndex(t => t.id === id)
      if (idx >= 0) {
        data.distillTasks[idx] = { ...data.distillTasks[idx], ...updates }
        writeDB(data)
        return data.distillTasks[idx]
      }
      return null
    },
    getDistillTask: (id: string) => readDB().distillTasks.find(t => t.id === id),

    // Users with pending actions (for email reminder)
    getUsersWithPendingActions: () => {
      const data = readDB()
      return data.users
        .filter(u => u.email)
        .map(user => ({
          ...user,
          actions: data.actions.filter((a: any) => a.userId === user.id && !a.done)
        }))
        .filter(u => u.actions.length > 0)
    },
  }
}

export type DB = ReturnType<typeof db>