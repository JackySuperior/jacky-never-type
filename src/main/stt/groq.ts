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
    // 只有「明確指定中文」時才給繁體提示。
    // 絕對不能在 auto（自動偵測）時加中文提示，否則會把英文等其他語言硬聽成中文！
    const zhHint = language === 'zh'
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
