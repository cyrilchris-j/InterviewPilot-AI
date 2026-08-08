export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function unique<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

export function normalizeKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function keywordHits(answer: string, keywords: string[]): number {
  const normalized = normalizeKey(answer);
  return keywords.filter((keyword) => normalized.includes(normalizeKey(keyword))).length;
}
