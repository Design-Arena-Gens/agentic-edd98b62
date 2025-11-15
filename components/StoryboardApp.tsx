"use client";
import { useEffect, useMemo, useState } from 'react';
import PreviewPlayer, { type Scene } from './PreviewPlayer';
import AdSlot from './AdSlot';
import { computeSceneDurations, splitStoryIntoScenes, buildSeed } from '../lib/story';

export default function StoryboardApp() {
  const [story, setStory] = useState('In a quiet village, a curious child discovers a hidden door. Beyond it lies a vibrant world of color and music. Friends are found, obstacles are faced, and courage grows. At last, the child returns home, forever changed by the adventure.');
  const [totalDurationSec, setTotalDurationSec] = useState(60);
  const [numScenes, setNumScenes] = useState(6);
  const [voiceName, setVoiceName] = useState<string | undefined>(undefined);

  const sentences = useMemo(() => splitStoryIntoScenes(story, numScenes), [story, numScenes]);
  const durations = useMemo(() => computeSceneDurations(totalDurationSec, sentences.length), [totalDurationSec, sentences.length]);

  const scenes: Scene[] = useMemo(() => sentences.map((text, idx) => ({
    id: idx,
    text,
    seed: buildSeed(text, idx),
    durationSec: durations[idx] ?? 1
  })), [sentences, durations]);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  return (
    <div className="grid">
      <div className="col">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title">Your Story</div>
            <span className="small">Generate an AI storyboard with voiceover</span>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 10 }}>
              <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="Write your story here?" />
              <div className="help">Tip: 2?4 sentences per scene works well.</div>
            </div>

            <div className="row">
              <div>
                <label className="small">Total Duration (5s ? 30m)</label>
                <div className="range-wrap">
                  <input
                    className="input"
                    type="range"
                    min={5}
                    max={1800}
                    value={totalDurationSec}
                    onChange={(e) => setTotalDurationSec(Number(e.target.value))}
                  />
                  <div className="small">{formatSeconds(totalDurationSec)}</div>
                </div>
              </div>
              <div>
                <label className="small">Number of Scenes</label>
                <div className="range-wrap">
                  <input
                    className="input"
                    type="range"
                    min={1}
                    max={30}
                    value={numScenes}
                    onChange={(e) => setNumScenes(Number(e.target.value))}
                  />
                  <div className="small">{numScenes}</div>
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 8 }}>
              <div>
                <label className="small">Voice</label>
                <select value={voiceName || ''} onChange={(e) => setVoiceName(e.target.value || undefined)}>
                  <option value="">System Default</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>{v.name} {v.lang ? `(${v.lang})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="small">KPIs</label>
                <div className="kpis">
                  <div className="kpi"><div className="small">Scenes</div><div>{scenes.length}</div></div>
                  <div className="kpi"><div className="small">Duration</div><div>{formatSeconds(totalDurationSec)}</div></div>
                  <div className="kpi"><div className="small">Words</div><div>{story.trim().split(/\s+/).filter(Boolean).length}</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PreviewPlayer scenes={scenes} voiceName={voiceName} />
      </div>

      <div className="col">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title">Sponsored</div>
          </div>
          <div className="card-body">
            <AdSlot />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Inline Ad</div>
          </div>
          <div className="card-body">
            <AdSlot />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatSeconds(total: number) {
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${s}s`;
}
