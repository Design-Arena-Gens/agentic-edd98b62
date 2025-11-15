"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type Scene = {
  id: number;
  text: string;
  seed: string;
  durationSec: number;
};

type Props = {
  scenes: Scene[];
  voiceName?: string;
};

export default function PreviewPlayer({ scenes, voiceName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState(false);

  const images = useMemo(() => {
    return scenes.map((s) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `https://picsum.photos/seed/${encodeURIComponent(s.seed)}/1280/720`;
      return img;
    });
  }, [scenes]);

  const totalDuration = useMemo(() => scenes.reduce((a, s) => a + s.durationSec, 0), [scenes]);

  const voices = typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : [];
  const selectedVoice = useMemo(() => {
    if (!voiceName) return undefined;
    return voices.find((v) => v.name === voiceName);
  }, [voiceName, voices]);

  const stopSpeech = () => {
    try { window.speechSynthesis.cancel(); } catch {}
  };

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    const utter = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utter.voice = selectedVoice;
    utter.rate = 1.0;
    utter.pitch = 1.02;
    utter.volume = 1.0;
    window.speechSynthesis.speak(utter);
  }, [selectedVoice]);

  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let start = performance.now();
    let sceneIdx = 0;
    let sceneStart = start;

    const draw = (now: number) => {
      if (!isPlaying) return;
      const elapsed = (now - start) / 1000;
      setProgress(Math.min(1, elapsed / totalDuration));

      // advance scene if needed
      const sceneElapsed = (now - sceneStart) / 1000;
      const current = scenes[sceneIdx];
      if (sceneElapsed >= current.durationSec && sceneIdx < scenes.length - 1) {
        sceneIdx += 1;
        sceneStart = now;
        setCurrentSceneIdx(sceneIdx);
        stopSpeech();
        speakText(scenes[sceneIdx].text);
      }

      // draw current scene
      const img = images[sceneIdx];
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      if (img && img.complete) {
        // cover fit
        const scale = Math.max(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.globalAlpha = 1;
        ctx.drawImage(img, dx, dy, dw, dh);
      }

      // overlay text box
      const pad = 24;
      const boxW = w - pad * 2;
      const boxH = Math.min(h * 0.3, 200);
      const boxY = h - boxH - pad;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(pad, boxY, boxW, boxH);

      ctx.fillStyle = 'white';
      ctx.font = '20px ui-sans-serif, system-ui, -apple-system, Segoe UI';
      ctx.textBaseline = 'top';

      const lines = wrapText(ctx, current.text, boxW - 20);
      let ty = boxY + 12;
      for (const line of lines) {
        ctx.fillText(line, pad + 10, ty);
        ty += 26;
      }

      if (elapsed < totalDuration) {
        raf = requestAnimationFrame(draw);
      } else {
        setIsPlaying(false);
        setCurrentSceneIdx(scenes.length - 1);
        stopSpeech();
      }
    };

    // kick off
    setCurrentSceneIdx(0);
    stopSpeech();
    if (scenes[0]) speakText(scenes[0].text);
    raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(raf);
  }, [images, isPlaying, scenes, speakText, stopSpeech, totalDuration]);

  useEffect(() => {
    if (isPlaying) {
      const cancel = renderLoop();
      return () => { cancel && cancel(); };
    }
  }, [isPlaying, renderLoop]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => { setIsPlaying(false); stopSpeech(); };
  const handleStop = () => { setIsPlaying(false); setProgress(0); setCurrentSceneIdx(0); stopSpeech(); };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const stream = canvasRef.current.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const exportDuration = scenes.reduce((a, s) => a + s.durationSec, 0) * 1000;
      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      });
      recorder.start();
      // play rendering while recording
      setIsPlaying(true);
      setTimeout(() => recorder.stop(), exportDuration + 200);
      const blob = await done;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'storyboard-preview.webm';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Export failed in this browser. Try Chrome desktop.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Preview</div>
        <div className="small">Scene {currentSceneIdx + 1} / {scenes.length}</div>
      </div>
      <div className="card-body">
        <div className="toolbar" style={{ marginBottom: 12 }}>
          <div className="controls">
            <button className="btn" onClick={handlePlay} disabled={isPlaying}>Play</button>
            <button className="btn secondary" onClick={handlePause} disabled={!isPlaying}>Pause</button>
            <button className="btn secondary" onClick={handleStop}>Stop</button>
            <button className="btn" onClick={handleExport} disabled={exporting || scenes.length === 0}>
              {exporting ? 'Exporting?' : 'Export Video (webm)'}
            </button>
          </div>
          <div className="small">Voiceover plays during preview</div>
        </div>
        <canvas ref={canvasRef} width={1280} height={720} />
        <div className="small" style={{ marginTop: 8 }}>Progress: {(progress * 100).toFixed(0)}%</div>
      </div>
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 6);
}
