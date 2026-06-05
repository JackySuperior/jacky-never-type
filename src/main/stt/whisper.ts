import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function transcribeWithOpenAI(
  audioBuffer: Buffer,
  apiKey: string,
  language: string
): Promise<string> {
  const client = new OpenAI({ apiKey });

  // 寫入暫存檔（OpenAI SDK 需要 File 物件）
  const tmpPath = path.join(os.tmpdir(), `jnt-${Date.now()}.webm`);
  fs.writeFileSync(tmpPath, audioBuffer);

  try {
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath) as unknown as File,
      model: 'whisper-1',
      language: language === 'auto' ? undefined : language,
      response_format: 'text',
    });
    return typeof transcription === 'string' ? transcription : (transcription as { text: string }).text;
  } finally {
    fs.unlinkSync(tmpPath);
  }
}
