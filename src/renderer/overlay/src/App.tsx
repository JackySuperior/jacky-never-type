import { useEffect, useRef, useState } from 'react';
import './App.css';

type State = 'idle' | 'recording' | 'processing';

declare global {
  interface Window {
    jnt: {
      sendAudioData: (buffer: ArrayBuffer) => void;
      onRecordingState: (cb: (data: { state: string; message?: string }) => void) => void;
      onStopRecording: (cb: () => void) => void;
      onToggleFromTray: (cb: () => void) => void;
      toggleRecording: () => void;
    };
  }
}

export default function App() {
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 監聽狀態變更
    window.jnt.onRecordingState(({ state: newState, message: msg }) => {
      setState(newState as State);
      setMessage(msg ?? '');

      if (newState === 'recording') {
        startLocalRecording();
      } else if (newState === 'idle' || newState === 'processing') {
        stopTimer();
      }
    });

    // 主進程要求停止錄音
    window.jnt.onStopRecording(() => {
      stopLocalRecording();
    });

    // 系統匣點擊
    window.jnt.onToggleFromTray(() => {
      window.jnt.toggleRecording();
    });
  }, []);

  function startLocalRecording() {
    // 避免重複啟動：若已有錄音或計時器在跑，先忽略
    if (mediaRecorderRef.current || timerRef.current) {
      console.warn('[Overlay] 已在錄音中，忽略重複啟動');
      return;
    }

    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('[Overlay] 收到音訊資料:', e.data.size, 'bytes');
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        console.log('[Overlay] 錄音結束，總大小:', arrayBuffer.byteLength, 'bytes');
        window.jnt.sendAudioData(arrayBuffer);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      console.log('[Overlay] 開始錄音，麥克風:', stream.getAudioTracks()[0]?.label);
    }).catch(err => {
      console.error('[Overlay] 麥克風存取失敗:', err);
    });
  }

  function stopLocalRecording() {
    stopTimer();
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function formatDuration(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  if (state === 'idle') return null;

  return (
    <div className={`overlay ${state}`}>
      {state === 'recording' && (
        <>
          <div className="dot pulse" />
          <span className="label">Recording {formatDuration(duration)}</span>
        </>
      )}
      {state === 'processing' && (
        <>
          <div className="spinner" />
          <span className="label">{message || 'Processing...'}</span>
        </>
      )}
    </div>
  );
}
