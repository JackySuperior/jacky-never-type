import { GoogleGenerativeAI } from '@google/generative-ai';

export async function transcribeWithGemini(
  audioBuffer: Buffer,
  apiKey: string,
  language: string,
  vocabulary?: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const languageHint = language === 'auto'
    ? ''
    : `請以${languageLabel(language)}輸出轉錄結果。`;

  const vocabHint = vocabulary && vocabulary.trim()
    ? `可能出現的人名／術語（請使用正確寫法）：${vocabulary.trim().replace(/\n+/g, '、')}。`
    : '';

  const prompt = `請將以下音訊內容轉錄為文字。只輸出轉錄文字，不加任何說明或標記。${languageHint}${vocabHint}`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'audio/webm',
        data: audioBuffer.toString('base64'),
      },
    },
  ]);

  return result.response.text().trim();
}

function languageLabel(lang: string): string {
  const map: Record<string, string> = {
    zh: '繁體中文',
    en: '英文',
    ja: '日文',
    ko: '韓文',
  };
  return map[lang] ?? lang;
}
