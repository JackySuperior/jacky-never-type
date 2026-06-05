import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function transcribeWithGroq(
  audioBuffer: Buffer,
  apiKey: string,
  language: string
): Promise<string> {
  const client = new Groq({ apiKey });

  const tmpPath = path.join(os.tmpdir(), `jnt-${Date.now()}.webm`);
  fs.writeFileSync(tmpPath, audioBuffer);

  try {
    // 用繁體中文範例文字當提示，讓 Whisper 偏向輸出繁體（zh 或 auto 時）
    const zhHint = (language === 'zh' || language === 'auto')
      ? '以下是一段繁體中文的語音內容，請使用台灣常用的繁體中文字。'
      : undefined;

    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-large-v3-turbo', // Groq 最快模型，~300ms
      language: language === 'auto' ? undefined : language,
      prompt: zhHint,
      response_format: 'text',
    });
    return typeof transcription === 'string' ? transcription : (transcription as { text: string }).text;
  } finally {
    fs.unlinkSync(tmpPath);
  }
}
