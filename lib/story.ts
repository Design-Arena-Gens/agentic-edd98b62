export function splitStoryIntoScenes(story: string, numScenes: number): string[] {
  const sentences = story
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return [];

  // Distribute sentences across numScenes
  const scenes: string[] = [];
  const perScene = Math.max(1, Math.ceil(sentences.length / numScenes));
  for (let i = 0; i < sentences.length; i += perScene) {
    scenes.push(sentences.slice(i, i + perScene).join(' '));
  }
  // If we have fewer than desired scenes, pad by splitting long scenes
  while (scenes.length < numScenes) {
    const idx = scenes.findIndex((s) => s.length === Math.max(...scenes.map((x) => x.length)));
    const s = scenes[idx];
    const mid = Math.floor(s.length / 2);
    scenes.splice(idx, 1, s.slice(0, mid).trim(), s.slice(mid).trim());
  }
  return scenes.slice(0, numScenes);
}

export function computeSceneDurations(totalSec: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor((totalSec / n) * 10) / 10; // 0.1s precision
  const arr = Array.from({ length: n }, () => base);
  let sum = arr.reduce((a, b) => a + b, 0);
  let i = 0;
  while (sum < totalSec) {
    arr[i % n] = Math.round((arr[i % n] + 0.1) * 10) / 10;
    sum = Math.round((sum + 0.1) * 10) / 10;
    i++;
  }
  return arr;
}

export function buildSeed(text: string, idx: number) {
  const keywords = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 5).join('-');
  return `${idx}-${keywords || 'scene'}`;
}
