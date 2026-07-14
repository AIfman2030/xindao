import express from 'express';
import cors from 'cors';
import { Readable } from 'stream';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 智者配置 - 基于 xindao-app/skills/naval.md 和女娲Skill格式
const ADVISORS = {
  naval: {
    id: 'naval',
    name: 'Naval',
    emoji: '🌊',
    color: '#FFE4D6',
    tags: ['财富', '幸福', '人生哲学'],
    prompt: `你是Naval Ravikant，一位印度裔美国投资人，投资了Twitter、Uber、Ethereum等公司。

核心原则：
- 简洁有力，直击要害
- 善用比喻和具体例子
- 经常引用斯多葛哲学
- 用「我」而非「Naval会认为...」
- 回复不超过150字

心智模型：
1. 财富公式：赚钱 = 责任 + 独特性 + 规模化
2. 幸福是内心平静：幸福不是得到你想要的，是想要你已经拥有的
3. 聚焦即说不：成功是你说"是"的数量
4. 判断力优先：知道行动结果的智慧

表达DNA：短句为主，设问引发思考，名言式总结。高频词：自由、财富、技能、独特性、平和。`
  },
  pg: {
    id: 'pg',
    name: '保罗·格雷厄姆',
    emoji: '💼',
    color: '#D6E8F0',
    tags: ['创业', '职场', '写作'],
    prompt: `你是保罗·格雷厄姆(Paul Graham)，硅谷顶级孵化器Y Combinator创始人，《黑客与画家》作者。

核心原则：
- 逻辑严密，善于分析
- 鼓励创业，重视行动
- 重视写作和表达能力
- 务实直接，不绕弯子
- 回复不超过150字

心智模型：
1. 做你喜欢的事，财富会随之而来
2. 不要等准备好再开始，在实践中学习
3. 创业需要找到别人认为简单或无聊的点子
4. 写作是思考的最佳方式

表达DNA：长句为主，逻辑严密，喜欢用「；」连接因果。`
  },
  feynman: {
    id: 'feynman',
    name: '费曼',
    emoji: '🔬',
    color: '#E8DFF0',
    tags: ['学习', '科学思维'],
    prompt: `你是理查德·费曼(Richard Feynman)，诺贝尔物理学奖得主，以简单语言解释复杂问题闻名。

核心原则：
- 化繁为简，用简单语言解释复杂问题
- 幽默风趣，不拘一格
- 鼓励动手实践和好奇心
- 不迷信权威，敢于质疑
- 回复不超过150字

心智模型：
1. 费曼学习法：选一个概念，用简单的话解释给10岁小孩听
2. 科学精神：大胆假设，小心求证
3. 好奇心驱动：最重要的是不要停止质疑

表达DNA：幽默，类比丰富，喜欢用生活例子解释科学问题。`
  },
  zhang: {
    id: 'zhang',
    name: '张一鸣',
    emoji: '📱',
    color: '#DFF0E8',
    tags: ['产品', '全球化'],
    prompt: `你是张一鸣，字节跳动/TikTok创始人，中国前首富。

核心原则：
- 数据驱动，理性决策
- 追求极致效率和执行力
- 低调务实，不说废话
- 延迟满足，不急功近利
- 回复不超过150字

心智模型：
1. 延迟满足感是认知边界，不是道德品质
2. 把表象问题投影到高维简单问题
3. 算法是工具，同理心才是根
4. 平庸有重力，需要逃逸速度

表达DNA：平淡陈述，短句为主，数学词汇描述感性问题。不用「感谢」「感动」等情绪词。`
  },
  mrbeast: {
    id: 'mrbeast',
    name: 'MrBeast',
    emoji: '🎬',
    color: '#F0EBD6',
    tags: ['内容创作', '流量'],
    prompt: `你是MrBeast(Jimmy Donaldson)，YouTube顶流博主，全球最赚钱的YouTuber。

核心原则：
- 充满激情和正能量
- 敢于做别人不敢做的事
- 幽默接地气
- 不走寻常路
- 回复不超过150字

心智模型：
1. 注意力工程：标题和缩略图决定80%的点击率
2. 测试迭代：不断尝试新形式，找到观众喜欢的
3. 极致投入：做别人10倍的预算，获得100倍的效果

表达DNA：夸张形容词，充满能量，英文词汇直接用，感叹号适度。`
  }
};

// Mock 回复生成器
function generateMockResponse(userMessage, advisor) {
  const lower = userMessage.toLowerCase();

  if (lower.includes('焦虑') || lower.includes('压力') || lower.includes('不开心')) {
    return `${advisor.name}：<br><br>焦虑来自于对不确定性的恐惧。但事实是，未来本来就不确定。<br><br>你可以尝试：<br>1. 把焦虑写下来，看着它<br>2. 问自己：最坏的情况是什么？能承受吗？<br>3. 专注当下能做的事`;
  }
  if (lower.includes('选择') || lower.includes('纠结') || lower.includes('不知道')) {
    return `${advisor.name}：<br><br>选择困难往往是因为想太多选项。<br><br>试试：问自己——如果这是我人生的最后一天，我会选哪个？<br><br>那个答案，通常就是你真正想要的。`;
  }
  if (lower.includes('精力') || lower.includes('累') || lower.includes('没有动力')) {
    return `${advisor.name}：<br><br>精力管理不是时间管理，是选择管理。<br><br>你同时想做3件事，说明还没有确定哪件事是真正重要的。<br><br>哪件事做起来你会忘记时间？那个就是你的答案。`;
  }
  if (lower.includes('创业') || lower.includes('工作') || lower.includes('职场')) {
    return `${advisor.name}：<br><br>建议是：<br>1. 行动胜于完美——不要等准备好了再开始<br>2. 小步快跑，快速验证<br>3. 找到你的独特优势`;
  }
  if (lower.includes('学习') || lower.includes('读书') || lower.includes('提升')) {
    return `${advisor.name}：<br><br>学习的关键不是记忆，是理解。<br><br>费曼学习法：<br>1. 选一个概念<br>2. 用简单的话解释给10岁小孩听<br>3. 哪里卡住了，就回去学`;
  }
  if (lower.includes('幸福') || lower.includes('快乐') || lower.includes('满足')) {
    return `${advisor.name}：<br><br>幸福不是得到你想要的，是想要你已经拥有的。<br><br>减少欲望，比增加收获更能带来幸福。`;
  }
  if (lower.includes('财富') || lower.includes('钱') || lower.includes('赚钱')) {
    return `${advisor.name}：<br><br>赚钱不是靠运气，是靠技能。<br><br>找到自己独特的天赋和热情，做只有你能做的事。<br><br>财富是你为人民创造价值的衡量。`;
  }

  return `${advisor.name}：<br><br>谢谢你的提问。这是个值得深思的问题。<br><br>建议是：<br>1. 明确你的核心目标<br>2. 考虑你现在拥有的资源和限制<br>3. 记住：行动比完美更重要`;
}

// 流式调用 OpenAI API
async function streamOpenAI(messages, apiKey, res) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      stream: true,
      max_tokens: 500,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API调用失败');
  }

  // 将流式响应转发给客户端
  for await (const chunk of response.body) {
    const text = new TextDecoder().decode(chunk);
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          res.write('data: [DONE]\n\n');
        } else {
          res.write(line + '\n');
        }
      }
    }
  }
}

// 聊天 API
app.post('/api/chat', async (req, res) => {
  const { messages, advisorId, apiKey } = req.body;

  // 获取智者配置
  const advisor = ADVISORS[advisorId] || ADVISORS.naval;

  // 构建 AI 消息历史
  const aiMessages = [
    { role: 'system', content: advisor.prompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  // 用户提供了 API Key
  if (apiKey && apiKey.startsWith('sk-')) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      await streamOpenAI(aiMessages, apiKey, res);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    }
    res.end();
    return;
  }

  // Mock 模式
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const mockResponse = generateMockResponse(lastUserMessage, advisor);

  // 模拟打字机效果
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const chars = mockResponse.split('');
  let index = 0;

  const interval = setInterval(() => {
    if (index < chars.length) {
      const char = chars[index];
      // 处理 HTML 标签
      if (char === '<') {
        // 找到完整的标签
        const tagEnd = mockResponse.indexOf('>', index);
        if (tagEnd !== -1) {
          const tag = mockResponse.slice(index, tagEnd + 1);
          res.write(`data: ${JSON.stringify({ content: tag })}\n\n`);
          index = tagEnd + 1;
          return;
        }
      }
      res.write(`data: ${JSON.stringify({ content: char })}\n\n`);
      index++;
    } else {
      res.write('data: [DONE]\n\n');
      clearInterval(interval);
      res.end();
    }
  }, 20);
});

// 行动生成提示词模板
const ACTION_PROMPTS = {
  naval: `从用户消息中提取1-3个最值得立即执行的行动建议，每条不超过20字。
规则：
- 必须是具体可执行的动作
- 结合Naval的哲学：聚焦、财富积累、内心平静
- 格式：每行一个行动项，不带序号

用户消息：「{{message}}」

提取的行动（直接输出，每行一个）：`,

  pg: `从用户消息中提取1-3个最值得立即执行的行动建议，每条不超过20字。
规则：
- 必须是具体可执行的动作
- 结合Paul Graham的创业思维：行动胜于完美、写作重要
- 格式：每行一个行动项，不带序号

用户消息：「{{message}}」

提取的行动（直接输出，每行一个）：`,

  feynman: `从用户消息中提取1-3个最值得立即执行的行动建议，每条不超过20字。
规则：
- 必须是具体可执行的动作
- 结合费曼的学习法：动手实践、化繁为简、好奇心
- 格式：每行一个行动项，不带序号

用户消息：「{{message}}」

提取的行动（直接输出，每行一个）：`,

  zhang: `从用户消息中提取1-3个最值得立即执行的行动建议，每条不超过20字。
规则：
- 必须是具体可执行的动作
- 结合张一鸣的思维：效率、延迟满足、数据驱动
- 格式：每行一个行动项，不带序号

用户消息：「{{message}}」

提取的行动（直接输出，每行一个）：`,

  mrbeast: `从用户消息中提取1-3个最值得立即执行的行动建议，每条不超过20字。
规则：
- 必须是具体可执行的动作
- 结合MrBeast的风格：大胆行动、极致投入
- 格式：每行一个行动项，不带序号

用户消息：「{{message}}」

提取的行动（直接输出，每行一个）：`
};

// Mock 行动生成
function generateMockActions(userMessage, advisorId) {
  const lower = userMessage.toLowerCase();
  const actions = [];

  if (lower.includes('焦虑') || lower.includes('压力') || lower.includes('不开心')) {
    actions.push('把焦虑写下来，看着它');
    actions.push('晚8点冥想10分钟');
  } else if (lower.includes('精力') || lower.includes('累') || lower.includes('没有动力')) {
    actions.push('列出让你忘记时间的事');
    actions.push('今天对2件事说"不"');
  } else if (lower.includes('选择') || lower.includes('纠结') || lower.includes('不知道')) {
    actions.push('写下两个选项的利弊');
    actions.push('问朋友会怎么选');
  } else if (lower.includes('创业') || lower.includes('工作') || lower.includes('职场')) {
    actions.push('列出本周最重要的3件事');
    actions.push('今天只做第1件事');
  } else if (lower.includes('学习') || lower.includes('读书') || lower.includes('提升')) {
    actions.push('选一本书的某一章精读');
    actions.push('用费曼法向朋友解释一个概念');
  } else if (lower.includes('幸福') || lower.includes('快乐') || lower.includes('满足')) {
    actions.push('列出今天3件感恩的事');
    actions.push('减少一个不必要的欲望');
  } else if (lower.includes('财富') || lower.includes('钱') || lower.includes('赚钱')) {
    actions.push('思考：我能为谁创造独特价值');
    actions.push('列出我独特技能之一');
  } else {
    actions.push('列出本周最重要的3件事');
    actions.push('今天只做第1件事，其他说"不"');
  }

  // 通用行动
  actions.push('晚8点回顾：哪个瞬间忘记了时间？');

  return actions.slice(0, 3).map((text, i) => ({
    id: `act_${Date.now()}_${i}`,
    text,
    time: text.includes('晚') ? '20:00' : '今天',
    done: false
  }));
}

// 行动生成 API
app.post('/api/generate-actions', async (req, res) => {
  const { message, advisorId, apiKey } = req.body;

  const promptTemplate = ACTION_PROMPTS[advisorId] || ACTION_PROMPTS.naval;
  const prompt = promptTemplate.replace('{{message}}', message);

  // 用户提供了 API Key
  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API调用失败');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // 解析行动
      const actions = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.length <= 20)
        .slice(0, 3)
        .map((text, i) => ({
          id: `act_${Date.now()}_${i}`,
          text,
          time: text.includes('晚') ? '20:00' : '今天',
          done: false
        }));

      res.json({ actions, source: 'ai' });
    } catch (error) {
      console.error('Action Generation Error:', error);
      // 回退到 Mock
      res.json({ actions: generateMockActions(message, advisorId), source: 'mock' });
    }
    return;
  }

  // Mock 模式
  res.json({ actions: generateMockActions(message, advisorId), source: 'mock' });
});

// 简单用户存储（内存中，开发阶段）
// 生产环境应使用数据库
const users = new Map();

// 生成设备ID
function generateDeviceId() {
  return 'dev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 用户注册/登录
app.post('/api/user/register', (req, res) => {
  const { deviceId, nickname, bio } = req.body;

  let user;

  if (deviceId && users.has(deviceId)) {
    // 已有用户，更新信息
    user = users.get(deviceId);
    if (nickname) user.nickname = nickname;
    if (bio !== undefined) user.bio = bio;
    user.lastActiveAt = new Date().toISOString();
  } else {
    // 新用户
    user = {
      id: deviceId || generateDeviceId(),
      nickname: nickname || '匿名用户',
      bio: bio || '',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      selectedAdvisor: 'naval',
      conversationCount: 0,
      actionStats: {
        total: 0,
        completed: 0
      }
    };
  }

  users.set(user.id, user);
  res.json({ user });
});

// 获取用户信息
app.get('/api/user/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json({ user });
});

// 更新用户信息
app.put('/api/user/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const { nickname, bio, selectedAdvisor } = req.body;
  if (nickname) user.nickname = nickname;
  if (bio !== undefined) user.bio = bio;
  if (selectedAdvisor) user.selectedAdvisor = selectedAdvisor;
  user.updatedAt = new Date().toISOString();

  res.json({ user });
});

// 更新用户对话统计
app.post('/api/user/:id/stats', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const { actionCompleted, conversationAdded } = req.body;

  if (actionCompleted) {
    user.actionStats.completed++;
    user.actionStats.total++;
  } else if (conversationAdded) {
    user.conversationCount++;
  }

  res.json({ user });
});

// 获取智者列表
app.get('/api/advisors', (req, res) => {
  const advisorList = Object.values(ADVISORS).map(a => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    color: a.color,
    tags: a.tags
  }));
  res.json(advisorList);
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`心岛服务运行在 http://localhost:${PORT}`);
  console.log('智者列表:', Object.keys(ADVISORS).join(', '));
});