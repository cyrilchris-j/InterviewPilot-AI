import { clamp, keywordHits, normalizeKey } from "../utils/text.js";
const productionTerms = [
    "monitor",
    "logging",
    "eval",
    "metric",
    "latency",
    "fallback",
    "security",
    "deploy",
    "test",
    "rollback",
    "trace",
    "observability"
];
const reasoningTerms = ["because", "tradeoff", "first", "then", "compare", "measure", "validate", "debug", "root cause"];
export class AnswerEvaluator {
    evaluate(question, answer, analysis) {
        const normalized = normalizeKey(answer);
        const words = normalized ? normalized.split(/\s+/).length : 0;
        const objectiveTerms = [...question.objective.split(/\s+/), ...question.dayTitle.split(/\s+/)].filter((term) => term.length > 4);
        const relevance = keywordHits(answer, objectiveTerms);
        const production = keywordHits(answer, productionTerms);
        const reasoning = keywordHits(answer, reasoningTerms);
        const correctness = clamp(Math.round(1.5 + relevance * 0.65 + Math.min(words, 90) / 35), 1, 5);
        const depth = clamp(Math.round(1 + Math.min(words, 140) / 35 + reasoning * 0.4), 1, 5);
        const confidence = clamp(Math.round(analysis.confidence / 2 + (words > 35 ? 1 : 0) - (normalized.includes("not sure") ? 1 : 0)), 1, 5);
        const practicalUnderstanding = clamp(Math.round(1.5 + production * 0.55 + relevance * 0.35 + Math.min(words, 120) / 60), 1, 5);
        const communication = clamp(Math.round(1 + Math.min(words, 120) / 45 + (answer.includes(".") ? 1 : 0)), 1, 5);
        const reasoningScore = clamp(Math.round(1.5 + reasoning * 0.7 + Math.min(words, 120) / 55), 1, 5);
        const productionThinking = clamp(Math.round(1 + production * 0.75 + (normalized.includes("user") ? 0.5 : 0)), 1, 5);
        const architectureThinking = clamp(Math.round(1 +
            keywordHits(answer, ["service", "pipeline", "database", "api", "queue", "cache", "component", "architecture"]) *
                0.7), 1, 5);
        const score = Number(((correctness +
            depth +
            confidence +
            practicalUnderstanding +
            communication +
            reasoningScore +
            productionThinking +
            architectureThinking) /
            8).toFixed(1));
        const detectedStrengths = [
            score >= 4 ? "Gave a specific, structured answer" : "",
            productionThinking >= 4 ? "Connected the idea to production behavior" : "",
            reasoningScore >= 4 ? "Explained a clear reasoning path" : ""
        ].filter(Boolean);
        const detectedGaps = [
            correctness <= 2 ? "Needs tighter grounding in the curriculum objective" : "",
            depth <= 2 ? "Answer stayed surface-level" : "",
            productionThinking <= 2 ? "Needs more production and evaluation detail" : ""
        ].filter(Boolean);
        return {
            correctness,
            depth,
            confidence,
            practicalUnderstanding,
            communication,
            reasoning: reasoningScore,
            productionThinking,
            architectureThinking,
            score,
            verdict: score >= 4 ? "strong" : score >= 2.8 ? "mixed" : "weak",
            evidence: score >= 4
                ? "The answer included relevant concepts, sequencing, and practical considerations."
                : score >= 2.8
                    ? "The answer addressed the topic but left some depth or production details unstated."
                    : "The answer needs more concrete reasoning and curriculum-grounded detail.",
            followUpHint: score >= 4
                ? "Push into tradeoffs, failure modes, or architecture constraints."
                : "Ask a simpler practical follow-up that lets the candidate reason step by step.",
            detectedStrengths,
            detectedGaps
        };
    }
}
