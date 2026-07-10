import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

// ============ 只需在这里填入你的 API Key ============
const API_KEY = 'your-api-key-here';
const AI_MODEL = 'gpt-4o-mini'; // 或 'gpt-4o', 'gpt-3.5-turbo'

// ============ Advisors Config ============
const ADVISORS = {
  naval: {
    id: 'naval',
    name: 'Naval',
    emoji: '🌊',
    color: '#FFE4D6',
    tags: ['财富', '幸福', '人生哲学'],
    systemPrompt: `你是Naval Ravikant，一位成功的印度裔美国投资人和创业者。
以太坊、Twitter、Uber等公司的早期投资人，AngelList创始人。
你的风格：
- 简洁有力，直击要害
- 善用比喻和具体例子
- 强调选择和心态
- 经常引用斯多葛哲学
- 回复要简短有力，不超过150字，用温暖的口吻`
  },
  pg: {
    id: 'pg',
    name: '保罗·格雷厄姆',
    emoji: '💼',
    color: '#D6E8F0',
    tags: ['创业', '职场', '写作'],
    systemPrompt: `你是保罗·格雷厄姆(Paul Graham)，Y Combinator联合创始人，硅谷最著名的孵化器创始人。
《黑客与画家》作者，被誉为"创业教父"。
你的风格：
- 逻辑严密，善于分析
- 鼓励年轻人勇敢创业
- 重视写作和表达能力
- 务实、直接
- 回复要逻辑清晰，不超过150字`
  },
  feynman: {
    id: 'feynman',
    name: '费曼',
    emoji: '🔬',
    color: '#E8DFF0',
    tags: ['学习', '科学思维'],
    systemPrompt: `你是理查德·费曼(Richard Feynman)，诺贝尔物理学奖得主，量子电动力学的创始人之一。
以深入浅出的解释闻名，曾在巴西、日本等多地任教。
你的风格：
- 化繁为简，用简单语言解释复杂问题
- 强调"知道"和"理解"的区别
- 幽默风趣，不惧权威
- 鼓励动手实践和好奇心
- 回复要生动有趣，不超过150字`
  },
  zhang: {
    id: 'zhang',
    name: '张一鸣',
    emoji: '📱',
    color: '#DFF0E8',
    tags: ['产品', '全球化'],
    systemPrompt: `你是张一鸣，字节跳动创始人，抖音、TikTok之父。
打造了史上最有价值的独角兽公司之一。
你的风格：
- 数据驱动，理性决策
- 强调"推荐"和"个性化"
- 追求极致效率和执行力
- 低调务实
- 回复要简洁高效，不超过150字`
  },
  mrbeast: {
    id: 'mrbeast',
    name: 'MrBeast',
    emoji: '🎬',
    color: '#F0EBD6',
    tags: ['内容创作', '流量'],
    systemPrompt: `你是MrBeast(吉米·唐纳森)，YouTube顶流博主，全球订阅量最高的个人创作者。
以极限挑战视频闻名，同时经营慈善项目。
你的风格：
- 充满激情和正能量
- 敢于做别人不敢做的事
- 强调"第一个吃螃蟹"的精神
- 幽默、接地气
- 回复要充满能量，不超过150字`
  }
};

// ============ OpenAI Client ============
let openai = null;

function getOpenAI() {
  if (!openai && API_KEY && API_KEY !== 'your-api-key-here') {
    openai = new OpenAI({ apiKey: API_KEY });
  }
  return openai;
}

// ============ In-Memory Store ============
const users = new Map();
const messages = new Map(); // userId -> messages[]

// ============ API Routes ============

app.get('/api/health', (req, res) => {
  const hasAI = !!getOpenAI();
  res.json({
    status: 'ok',
    hasAI,
    time: new Date().toISOString()
  });
});

// Register / Login
app.post('/api/auth', (req, res) => {
  const { nickname, bio } = req.body;
  if (!nickname) {
    return res.status(400).json({ error: '昵称必填' });
  }

  const userId = 'user_' + Date.now();
  const user = {
    id: userId,
    nickname: nickname.substring(0, 8),
    bio: (bio || '').substring(0, 20),
    createdAt: new Date().toISOString()
  };

  users.set(userId, user);
  messages.set(userId, []);

  res.json({ success: true, user });
});

// Select Advisor
app.post('/api/user/advisor', (req, res) => {
  const { userId, advisorId } = req.body;
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  if (!ADVISORS[advisorId]) {
    return res.status(400).json({ error: '智者不存在' });
  }

  user.advisorId = advisorId;
  users.set(userId, user);

  res.json({ success: true, advisor: ADVISORS[advisorId] });
});

// Get User
app.get('/api/user/:userId', (req, res) => {
  const user = users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const advisor = user.advisorId ? ADVISORS[user.advisorId] : null;
  res.json({ user, advisor });
});

// Get Advisors List
app.get('/api/advisors', (req, res) => {
  const list = Object.values(ADVISORS).map(({ id, name, emoji, color, tags }) => ({
    id, name, emoji, color, tags
  }));
  res.json({ advisors: list });
});

// Send Message (Real AI)
app.post('/api/chat', async (req, res) => {
  const { userId, content } = req.body;
  const user = users.get(userId);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  if (!user.advisorId) {
    return res.status(400).json({ error: '请先选择智者' });
  }

  const advisor = ADVISORS[user.advisorId];
  const userMsg = {
    id: 'msg_' + Date.now(),
    role: 'user',
    content,
    createdAt: new Date().toISOString()
  };

  // Store user message
  const userMsgs = messages.get(userId) || [];
  userMsgs.push(userMsg);

  // Get AI response
  let aiContent;
  const ai = getOpenAI();

  if (ai) {
    try {
      const completion = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: advisor.systemPrompt },
          { role: 'user', content: content }
        ],
        max_tokens: 300,
        temperature: 0.8
      });
      aiContent = completion.choices[0].message.content
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>');
    } catch (err) {
      console.error('OpenAI Error:', err.message);
      aiContent = `${advisor.name}正在思考中，请稍候...（AI服务暂时不可用）`;
    }
  } else {
    // Fallback mock responses
    aiContent = generateMockResponse(advisor, content);
  }

  const aiMsg = {
    id: 'msg_' + (Date.now() + 1),
    role: 'ai',
    content: aiContent,
    advisorId: advisor.id,
    advisorName: advisor.name,
    advisorEmoji: advisor.emoji,
    advisorColor: advisor.color,
    createdAt: new Date().toISOString()
  };

  userMsgs.push(aiMsg);
  messages.set(userId, userMsgs);

  // Generate action card
  const actionCard = await generateActionCard(ai, advisor, content);

  res.json({
    userMessage: userMsg,
    aiMessage: aiMsg,
    actionCard
  });
});

// Get Chat History
app.get('/api/chat/:userId', (req, res) => {
  const msgs = messages.get(req.params.userId) || [];
  res.json({ messages: msgs });
});

// Get Actions
app.get('/api/actions/:userId', (req, res) => {
  const userMsgs = messages.get(req.params.userId) || [];
  const actions = [];
  userMsgs.filter(m => m.role === 'ai' && m.actionCard).forEach(m => {
    if (m.actionCard.items) {
      actions.push(...m.actionCard.items);
    }
  });

  res.json({
    actions: actions.slice(0, 10),
    stats: {
      done: actions.filter(a => a.done).length,
      total: actions.length
    }
  });
});

// Complete Action
app.post('/api/actions/complete', (req, res) => {
  const { userId, actionIndex } = req.body;
  const userMsgs = messages.get(userId) || [];

  for (let i = userMsgs.length - 1; i >= 0; i--) {
    const m = userMsgs[i];
    if (m.role === 'ai' && m.actionCard && m.actionCard.items && m.actionCard.items[actionIndex]) {
      m.actionCard.items[actionIndex].done = true;
      break;
    }
  }

  messages.set(userId, userMsgs);
  res.json({ success: true });
});

// ============ Mock Response (No API Key) ============
function generateMockResponse(advisor, userMessage) {
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('焦虑') || lowerMsg.includes('压力')) {
    return `${advisor.name}：<br><br>焦虑来自于<span class="highlight">对不确定性的恐惧</span>。但事实是，未来本来就不确定。<br><br>你可以尝试：<br>1. 把焦虑写下来，看着它<br>2. 问自己：最坏的情况是什么？能承受吗？<br>3. 专注当下能做的事`;
  }

  if (lowerMsg.includes('选择') || lowerMsg.includes('纠结')) {
    return `${advisor.name}：<br><br>选择困难往往是因为<span class="highlight">想太多选项</span>。<br><br>试试：问自己——如果这是我人生的最后一天，我会选哪个？<br><br>那个答案，通常就是你真正想要的。`;
  }

  if (lowerMsg.includes('精力') || lowerMsg.includes('累')) {
    return `${advisor.name}：<br><br>精力管理不是时间管理，是<span class="highlight">选择管理</span>。<br><br>你同时想做3件事，说明还没有确定哪件事是<span class="highlight">真正重要的</span>。<br><br>哪件事做起来你会忘记时间？那个就是你的答案。`;
  }

  if (lowerMsg.includes('创业') || lowerMsg.includes('工作')) {
    return `${advisor.name}：<br><br>建议是：<br>1. <span class="highlight">行动胜于完美</span>——不要等准备好了再开始<br>2. 小步快跑，快速验证<br>3. 找到你的独特优势<br><br>成功的创业者和普通人的区别在于：前者一直在做，后者一直在想。`;
  }

  if (lowerMsg.includes('学习') || lowerMsg.includes('读书')) {
    return `${advisor.name}：<br><br>学习的关键不是记忆，是<span class="highlight">理解</span>。<br><br>费曼学习法：<br>1. 选一个概念<br>2. 用简单的话解释给10岁小孩听<br>3. 哪里卡住了，就回去学<br><br>如果你不能简单地解释它，你就没有真正理解它。`;
  }

  return `${advisor.name}：<br><br>谢谢你的提问。这是个值得深思的问题。<br><br>建议是：<br>1. <span class="highlight">明确你的核心目标</span><br>2. 考虑你现在拥有的资源和限制<br>3. 记住：行动比完美更重要`;
}

// ============ Generate Action Card ============
async function generateActionCard(ai, advisor, userMessage) {
  const defaultActions = [
    { text: '列出本周最重要的3件事', time: '今天', done: false },
    { text: '今天只做第1件事，其他说"不"', time: '今天', done: false },
    { text: '晚8点回顾：哪个瞬间忘记了时间？', time: '20:00', done: false },
    { text: '写下你真正想要的1件事', time: '今天', done: false },
    { text: '拒绝一个不重要的请求', time: '今天', done: false },
    { text: '读一本你一直想读但没读的书的前10页', time: '今天', done: false },
    { text: '早起30分钟，享受安静的早晨', time: '明天', done: false },
    { text: '给一个很久没联系的朋友发消息', time: '本周', done: false }
  ];

  // Try to generate contextual actions with AI
  if (ai) {
    try {
      const completion = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `你是一个行动建议助手。根据用户的对话，生成3个具体可执行的行动建议。
格式要求：
- 每个建议不超过15个字
- 必须是可立即执行的行动
- 用换行分隔
只返回建议，不要其他解释。`
          },
          { role: 'user', content: `用户的困惑是：${userMessage}\n\n请生成3个具体的行动建议：` }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      const suggestions = completion.choices[0].message.content
        .split('\n')
        .filter(s => s.trim())
        .slice(0, 3)
        .map((text, i) => ({
          text: text.replace(/^\d+[\.\)]\s*/, '').trim(),
          time: i === 0 ? '今天' : (i === 1 ? '今天' : '本周'),
          done: false
        }));

      if (suggestions.length >= 2) {
        return {
          title: '今日行动',
          items: suggestions,
          createdAt: new Date().toISOString()
        };
      }
    } catch (err) {
      console.log('Action card AI failed, using defaults');
    }
  }

  // Fallback to random picks
  const shuffled = defaultActions.sort(() => 0.5 - Math.random());
  return {
    title: '今日行动',
    items: shuffled.slice(0, 3),
    createdAt: new Date().toISOString()
  };
}

// ============ Start Server ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n🏝️  心岛服务器已启动');
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\nAPI Key: ${API_KEY === 'your-api-key-here' ? '❌ 未配置' : '✅ 已配置'}`);
  console.log(`AI模型: ${AI_MODEL}`);
  console.log('\n可用接口:');
  console.log('  GET  /api/health         - 健康检查');
  console.log('  POST /api/auth           - 注册/登录');
  console.log('  POST /api/user/advisor   - 选择智者');
  console.log('  GET  /api/advisors       - 获取智者列表');
  console.log('  POST /api/chat           - 发送消息（AI回复）');
  console.log('  GET  /api/chat/:userId   - 获取聊天记录');
  console.log('\n');
});