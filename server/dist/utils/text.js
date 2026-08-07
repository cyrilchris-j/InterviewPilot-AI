export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function average(values) {
    return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}
export function unique(values) {
    return Array.from(new Set(values));
}
export function normalizeKey(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
export function keywordHits(answer, keywords) {
    const normalized = normalizeKey(answer);
    return keywords.filter((keyword) => normalized.includes(normalizeKey(keyword))).length;
}
