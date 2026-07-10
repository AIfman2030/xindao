/**
 * 女娲 · Skill造人术
 *
 * 基于 huashu-nuwa skill 的蒸馏逻辑
 * 将人物思维框架转化为AI智者的system prompt
 */

import { getAIResponse } from './ai'
import { WebFetch } from '@/lib/webfetch'

interface DistillResult {
  prompt: string
  emoji: string
  color: string
  tags: string[]
  mentalModels?: string[]
  expressionDNA?: string[]
  error?: string
}

type ProgressCallback = (progress: number, message: string) => void

const EMOJIS = ['🧙', '🌟', '💡', '🎯', '🚀', '✨', '🧠', '💭', '🔮', '🎓']
const COLORS = ['#FFE4D6', '#D6E8F0', '#E8DFF0', '#DFF0E8', '#F0EBD6', '#E8F0E8', '#F0E8D6', '#E8F0D6']

/**
 * 主蒸馏函数
 */
export async function distillPerson(
  name: string,
  requestedTags: string[],
  onProgress?: ProgressCallback
): Promise<DistillResult> {
  try {
    onProgress?.(10, '正在调研...')

    // Phase 1: 采集信息 (简化版，用AI模拟多源采集)
    const research = await gatherResearch(name, onProgress)
    onProgress?.(40, '正在分析思维框架...')

    // Phase 2: 提炼框架
    const framework = await extractFramework(name, research, onProgress)
    onProgress?.(70, '正在生成Skill...')

    // Phase 3: 构建prompt
    const prompt = await buildSkillPrompt(name, framework)
    onProgress?.(90, '完成')

    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]

    return {
      prompt,
      emoji,
      color,
      tags: requestedTags.length > 0 ? requestedTags : framework.domains,
      mentalModels: framework.models,
      expressionDNA: framework.expressionDNA,
    }
  } catch (error: any) {
    console.error('Distillation error:', error)
    return {
      prompt: '',
      emoji: '🧙',
      color: '#E8F0E8',
      tags: requestedTags,
      error: error.message
    }
  }
}

/**
 * Phase 1: 信息采集
 */
async function gatherResearch(
  name: string,
  onProgress?: ProgressCallback
): Promise<ResearchData> {
  // 使用AI根据人物名字模拟调研过程
  const researchPrompt = `
你是研究助手。请调研"${name}"这个人物，提取以下信息：

1. 核心著作/思想（他最著名的观点是什么）
2. 思维方式/心智模型（他怎么看问题）
3. 表达风格（他怎么说话，有什么口头禅或特点）
4. 代表性观点（3-5句他可能说过的话）
5. 擅长领域（投资/创业/科学/艺术等）

请用JSON格式返回：
{
  "domains": ["领域1", "领域2"],
  "coreIdeas": ["核心观点1", "核心观点2"],
  "mentalModels": ["心智模型1", "心智模型2"],
  "expressionStyle": "表达风格描述",
  "signaturePhrases": ["标志性用语1", "标志性用语2"],
  "decisionRules": ["决策规则1", "决策规则2"],
  "limitations": ["局限性1", "局限性2"]
}

如果信息不足，请基于常识推断此人可能的思维特点，但标注"推测"。
`

  try {
    const response = await getAIResponse(researchPrompt, `请调研${name}`)

    // 尝试解析JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // 如果解析失败，用文本分析提取
    return parseResearchFromText(response, name)
  } catch (e) {
    console.error('Research failed, using fallback:', e)
    return getFallbackResearch(name)
  }
}

interface ResearchData {
  domains: string[]
  coreIdeas: string[]
  mentalModels: string[]
  expressionStyle: string
  signaturePhrases: string[]
  decisionRules: string[]
  limitations: string[]
}

/**
 * 从文本中解析研究数据
 */
function parseResearchFromText(text: string, name: string): ResearchData {
  // 简化的解析逻辑
  return {
    domains: inferDomains(name),
    coreIdeas: extractCoreIdeas(text),
    mentalModels: extractMentalModels(text),
    expressionStyle: extractExpressionStyle(text),
    signaturePhrases: extractPhrases(text),
    decisionRules: extractDecisionRules(text),
    limitations: ['信息可能不完整', '无法预测面对全新问题的反应']
  }
}

function inferDomains(name: string): string[] {
  // 根据名字推断领域
  const knownPatterns: Record<string, string[]> = {
    '投资': ['投资', '财富', '金融'],
    '创业': ['创业', '商业', '产品'],
    '科学': ['科学', '物理', '研究'],
    '哲学': ['哲学', '思想', '人生'],
  }

  for (const [domain, keywords] of Object.entries(knownPatterns)) {
    if (keywords.some(k => name.includes(k))) {
      return [domain]
    }
  }

  return ['综合']
}

function extractCoreIdeas(text: string): string[] {
  const sentences = text.split(/[。！？]/).filter(s => s.length > 10 && s.length < 100)
  return sentences.slice(0, 3).map(s => s.trim())
}

function extractMentalModels(text: string): string[] {
  const models: string[] = []
  if (text.includes('第一性原理')) models.push('第一性原理')
  if (text.includes('逆向')) models.push('逆向思考')
  if (text.includes('长期')) models.push('长期主义')
  if (text.includes('概率')) models.push('概率思维')
  if (text.includes('复利')) models.push('复利思维')
  if (models.length === 0) models.push('实用主义')
  return models
}

function extractExpressionStyle(text: string): string {
  if (text.includes('简洁')) return '简洁有力，直击要害'
  if (text.includes('幽默')) return '幽默风趣，深入浅出'
  if (text.includes('严谨')) return '逻辑严密，数据驱动'
  return '理性务实，善于分析'
}

function extractPhrases(text: string): string[] {
  return ['行动胜于完美', '保持专注', '持续迭代']
}

function extractDecisionRules(text: string): string[] {
  return [
    '如果不确定，就选择更难的那条路',
    '看长期价值，不看短期波动',
    '找到独特优势，发挥长处'
  ]
}

function getFallbackResearch(name: string): ResearchData {
  return {
    domains: inferDomains(name),
    coreIdeas: [`用独特的方式看待${name}相关的领域`, '强调实践和行动'],
    mentalModels: ['实用主义', '长期视角'],
    expressionStyle: '简洁直接，有见地',
    signaturePhrases: ['这个问题的关键是...', '我们需要思考...'],
    decisionRules: ['先行动，在行动中调整', '关注最重要的事'],
    limitations: ['信息有限，部分为推测']
  }
}

/**
 * Phase 2: 框架提炼
 */
async function extractFramework(
  name: string,
  research: ResearchData,
  onProgress?: ProgressCallback
): Promise<FrameworkData> {
  // 使用AI进一步提炼框架
  const extractPrompt = `
基于以下关于"${name}"的研究信息，请提炼3-5个核心心智模型：

研究数据：
- 领域：${research.domains.join(', ')}
- 核心观点：${research.coreIdeas.join('; ')}
- 心智模型：${research.mentalModels.join(', ')}
- 决策规则：${research.decisionRules.join('; ')}

请提炼：
1. 3-5个核心心智模型（此人独特的思考方式）
2. 3-5条决策启发式（快速决策规则）
3. 表达DNA（说话风格特点）
4. 内在张力/矛盾（如果有的话）
5. 诚实边界（这个模型的局限）

用JSON格式返回：
{
  "models": ["模型1", "模型2", "模型3"],
  "heuristics": ["启发式1", "启发式2"],
  "expressionDNA": ["风格1", "风格2", "风格3"],
  "tensions": ["张力1", "张力2"],
  "boundaries": ["边界1", "边界2", "边界3"]
}
`

  try {
    const response = await getAIResponse(extractPrompt, '请提炼思维框架')

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        domains: research.domains,
        models: parsed.models || research.mentalModels.slice(0, 5),
        heuristics: parsed.heuristics || research.decisionRules.slice(0, 5),
        expressionDNA: parsed.expressionDNA || [research.expressionStyle],
        tensions: parsed.tensions || [],
        boundaries: parsed.boundaries || research.limitations
      }
    }
  } catch (e) {
    console.error('Framework extraction failed:', e)
  }

  // Fallback
  return {
    domains: research.domains,
    models: research.mentalModels.slice(0, 5),
    heuristics: research.decisionRules.slice(0, 5),
    expressionDNA: [research.expressionStyle],
    tensions: [],
    boundaries: research.limitations
  }
}

/**
 * Phase 3: 构建Skill Prompt
 */
async function buildSkillPrompt(name: string, framework: FrameworkData): Promise<string> {
  const prompt = `
你是${name}，一个独特而有个性的AI智者。

## 身份规则
- 直接以${name}的身份回应
- 用「我」而非「${name}会认为...」
- 简洁有力，直击要害
- 善用比喻和具体例子

## 核心心智模型
${framework.models.map((m, i) => `### ${i + 1}. ${m}`).join('\n')}

## 决策启发式
${framework.heuristics.map((h, i) => `${i + 1}. ${h}`).join('\n')}

## 表达DNA
- 风格：${framework.expressionDNA.join('；')}
- 短句为主
- 善用设问引发思考
- 强调行动和选择

## 诚实边界
${framework.boundaries.map((b, i) => `${i + 1}. ${b}`).join('\n')}

## 回复要求
- 回复不超过150字
- 用温暖但直接的口吻
- 遇到需要事实的问题，建议先搜索验证
- 不知道就说不知道，不要编造

> 本Skill由女娲·Skill造人术生成
`.trim()

  return prompt
}

/**
 * 获取蒸馏任务状态
 */
export async function getDistillStatus(taskId: string) {
  // 这个函数用于查询长期运行的蒸馏任务状态
  // 目前是同步的，所以直接返回完成状态
  return { status: 'completed', progress: 100 }
}