import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function getAIResponse(
  systemPrompt: string,
  userMessage: string,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return generateMockResponse(userMessage)
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 300,
      temperature: 0.8,
    })

    return completion.choices[0].message.content
      ?.replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>') || ''
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return generateMockResponse(userMessage)
  }
}

export async function generateActionCard(
  userMessage: string,
  model: string = 'gpt-4o-mini'
): Promise<Array<{ text: string; time: string; done: boolean }>> {
  if (!process.env.OPENAI_API_KEY) {
    return generateMockActions(userMessage)
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `你是一个行动建议助手。根据用户的困惑，生成3个具体可执行的行动建议。
格式要求：
- 每个建议不超过20个字
- 必须是可立即执行的行动
- 用换行分隔
只返回建议，不要其他解释。`,
        },
        {
          role: 'user',
          content: `用户的困惑是：${userMessage}\n\n请生成3个具体的行动建议：`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const suggestions = completion.choices[0].message.content
      ?.split('\n')
      .filter((s) => s.trim())
      .slice(0, 3)
      .map((text, i) => ({
        text: text.replace(/^\d+[.)]\s*/, '').trim(),
        time: i === 0 ? '今天' : i === 1 ? '今天' : '本周',
        done: false,
      }))

    if (suggestions && suggestions.length >= 2) {
      return suggestions
    }
  } catch (error) {
    console.error('Action card generation error:', error)
  }

  return generateMockActions(userMessage)
}

function generateMockResponse(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('焦虑') || lower.includes('压力')) {
    return `焦虑来自于<span class="highlight">对不确定性的恐惧</span>。但事实是，未来本来就不确定。<br/><br/>你可以尝试：<br/>1. 把焦虑写下来，看着它<br/>2. 问自己：最坏的情况是什么？能承受吗？<br/>3. 专注当下能做的事`
  }
  if (lower.includes('选择') || lower.includes('纠结')) {
    return `选择困难往往是因为<span class="highlight">想太多选项</span>。<br/><br/>试试：问自己——如果这是我人生的最后一天，我会选哪个？<br/><br/>那个答案，通常就是你真正想要的。`
  }
  if (lower.includes('精力') || lower.includes('累')) {
    return `精力管理不是时间管理，是<span class="highlight">选择管理</span>。<br/><br/>你同时想做3件事，说明还没有确定哪件事是<span class="highlight">真正重要的</span>。<br/><br/>哪件事做起来你会忘记时间？那个就是你的答案。`
  }
  if (lower.includes('创业') || lower.includes('工作')) {
    return `建议是：<br/>1. <span class="highlight">行动胜于完美</span>——不要等准备好了再开始<br/>2. 小步快跑，快速验证<br/>3. 找到你的独特优势`
  }
  if (lower.includes('学习') || lower.includes('读书')) {
    return `学习的关键不是记忆，是<span class="highlight">理解</span>。<br/><br/>费曼学习法：<br/>1. 选一个概念<br/>2. 用简单的话解释给10岁小孩听<br/>3. 哪里卡住了，就回去学`
  }

  return `谢谢你的提问。这是个值得深思的问题。<br/><br/>建议是：<br/>1. <span class="highlight">明确你的核心目标</span><br/>2. 考虑你现在拥有的资源和限制<br/>3. 记住：行动比完美更重要`
}

function generateMockActions(message: string): Array<{ text: string; time: string; done: boolean }> {
  const lower = message.toLowerCase()

  if (lower.includes('焦虑') || lower.includes('压力')) {
    return [
      { text: '把焦虑写下来，看着它', time: '今天', done: false },
      { text: '晚8点冥想10分钟', time: '20:00', done: false },
    ]
  }
  if (lower.includes('精力') || lower.includes('累')) {
    return [
      { text: '列出让你忘记时间的事', time: '今天', done: false },
      { text: '今天对2件事说"不"', time: '今天', done: false },
    ]
  }
  if (lower.includes('选择') || lower.includes('纠结')) {
    return [
      { text: '写下两个选项的利弊', time: '今天', done: false },
      { text: '问朋友会怎么选', time: '今天', done: false },
    ]
  }

  return [
    { text: '列出本周最重要的3件事', time: '今天', done: false },
    { text: '今天只做第1件事，其他说"不"', time: '今天', done: false },
    { text: '晚8点回顾：哪个瞬间忘记了时间？', time: '20:00', done: false },
  ]
}

export { openai }