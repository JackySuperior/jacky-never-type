import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function transcribeWithGroq(
  audioBuffer: Buffer,
  apiKey: string,
  language: string,
  vocabulary?: string
): Promise<string> {
  const client = new Groq({ apiKey });

  const tmpPath = path.join(os.tmpdir(), `jnt-${Date.now()}.webm`);
  fs.writeFileSync(tmpPath, audioBuffer);

  try {
    // 用繁體中文範例文字當提示，讓 Whisper 偏向輸出繁體（zh 或 auto 時）
    const zhHint = (language === 'zh' || language === 'auto')
      ? '以下是一段繁體中文的語音內容，請使用台灣常用的繁體中文字。'
      : '';
    // 把自訂詞彙塞進 prompt，提高人名／術語辨識正確率
    const vocabHint = vocabulary && vocabulary.trim()
      ? ` 可能出現的詞彙：${vocabulary.trim().replace(/\n+/g, '、')}。`
      : '';
    const promptText = (zhHint + vocabHint).trim() || undefined;

    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-large-v3-turbo', // Groq 最快模型，~300ms
      language: language === 'auto' ? undefined : language,
      prompt: promptText,
      response_format: 'text',
    });
    return typeof transcription === 'string' ? transcription : (transcription as { text: string }).text;
  } finally {
    fs.unlinkSync(tmpPath);
  }
}
