import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AppSettings, OUTPUT_LANGUAGES } from '../../shared/types';

const PROMPTS = {
  light: `你是語音輸入後處理器。請對以下語音轉文字結果做輕度修飾：
- 移除明顯的語助詞（嗯、啊、那個、就是、然後）
- 修正標點符號
- 保持原意，不改變內容
只輸出修飾後的文字，不加任何解釋。`,

  standard: `你是語音輸入後處理器。請對以下語音轉文字結果做標準修飾：
- 移除所有語助詞和填充詞（嗯、啊、那個、就是、然後、對對對、這個）
- 修正標點符號和段落分隔
- 修正明顯的語音辨識錯誤
- 讓句子更通順自然
- 保持說話者原本的意思和語氣
只輸出修飾後的文字，不加任何解釋。`,

  strong: `你是語音輸入後處理器。請對以下語音轉文字結果做強力修飾：
- 完全移除語助詞、填充詞、重複用語
- 偵測「說錯後又改口」的情況：只保留說話者最終想表達的版本，捨棄被修正掉的前一句（例如「我們禮拜三、啊不對是禮拜四開會」→「我們禮拜四開會」）
- 將口語表達轉為流暢的書面語，修正語法和措辭
- 【分段規則】積極依語意分段，讓結果易讀：
  · 當內容包含多個句子或多個主題時，不同主題之間要用「空行」分成不同段落
  · 若內容是步驟、清單、或並列的多個項目，請用條列（每項一行，前面加「- 」）呈現
  · 只有單一短句時才維持一行，不必硬分段
- 保持說話者的核心意思，不要自行新增原文沒有的資訊，也不要做摘要或刪減重要內容
只輸出修飾後的文字，不加任何解釋。`,
};

// 依設定產生「輸出語言」規則
function buildLanguageRule(settings: AppSettings): string {
  if (settings.outputMode === 'fixed') {
    const lang = OUTPUT_LANGUAGES.find(l => l.code === settings.outputLanguage);
    const langName = lang ? lang.name : settings.outputLanguage;
    return `
【輸出語言】無論輸入是什麼語言，請務必將最終結果**完整輸出為「${langName}」**。若原文不是這個語言，請翻譯成這個語言再輸出。`;
  }
  // original：維持說話者原本語言，中文則用繁體
  return `
【輸出語言】請維持說話者原本使用的語言（自動判斷），不要翻譯。若內容是中文，一律使用台灣慣用的「繁體中文」，絕對不要輸出簡體字。`;
}

export async function refineText(
  rawText: string,
  settings: AppSettings
): Promise<string> {
  if (!settings.aiEnabled || !rawText.trim()) return rawText;

  const prompt = PROMPTS[settings.aiStrength] + buildLanguageRule(settings);
  const userMessage = `請修飾以下文字：\n\n${rawText}`;

  try {
    switch (settings.aiProvider) {
      case 'openai':
        return await refineWithOpenAI(prompt, userMessage, settings.openaiApiKey);
      case 'gemini':
        return await refineWithGemini(prompt, userMessage, settings.geminiApiKey);
      case 'groq':
        return await refineWithGroq(prompt, userMessage, settings.groqApiKey);
      default:
        return rawText;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AI Refiner] 修飾失敗，回傳原文:', err);
    try {
      const p = path.join(app.getPath('userData'), 'jnt-debug.log');
      fs.appendFileSync(p, `[${new Date().toISOString()}] AI修飾失敗(provider=${settings.aiProvider}): ${msg}\n`);
    } catch { /* ignore */ }
    return rawText; // 失敗時不中斷，直接用原文
  }
}

async function refineWithOpenAI(systemPrompt: string, userMessage: string, apiKey: string): Promise<string> {
  const client = new OpenAI({ apiKey });
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });
  return res.choices[0]?.message?.content?.trim() ?? userMessage;
}

async function refineWithGemini(systemPrompt: string, userMessage: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(userMessage);
  return result.response.text().trim();
}

async function refineWithGroq(systemPrompt: string, userMessage: string, apiKey: string): Promise<string> {
  const client = new Groq({ apiKey });
  const res = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });
  return res.choices[0]?.message?.content?.trim() ?? userMessage;
}
