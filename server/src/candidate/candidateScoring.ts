import type { CandidateProfile, CandidateScore, Difficulty } from "../types/domain.js";
import { clamp } from "../utils/text.js";

export const SCORE_WEIGHTS = {
  completion: 0.45,
  mastery: 0.35,
  consistency: 0.2
} as const;

export const MASTERY_ATTEMPT_BANDS: Array<{ maxAttempts: number; factor: number }> = [
  { maxAttempts: 1, factor: 1 },
  { maxAttempts: 2, factor: 0.75 },
  { maxAttempts: 3, factor: 0.5 },
  { maxAttempts: 4, factor: 0.25 },
  { maxAttempts: Number.POSITIVE_INFINITY, factor: 0 }
];

const HARD_THRESHOLD = 80;
const MEDIUM_THRESHOLD = 55;

export class CandidateScoring {
  score(profile: CandidateProfile): CandidateScore {
    const completion = this.completion(profile);
    const mastery = this.mastery(profile);
    const consistency = this.consistency(profile);
    const overall = Math.round(
      completion * SCORE_WEIGHTS.completion +
        mastery * SCORE_WEIGHTS.mastery +
        consistency * SCORE_WEIGHTS.consistency
    );

    return {
      completion,
      mastery,
      consistency,
      overall,
      confidence: clamp(Math.round(overall / 10), 1, 10),
      difficulty: this.difficulty(overall)
    };
  }

  private completion(profile: CandidateProfile): number {
    return Math.round(clamp((profile.signals.missionsCompleted / profile.totalDays) * 100, 0, 100));
  }

  private mastery(profile: CandidateProfile): number {
    const firstTry = Math.round(profile.attempts.firstTryRate * 70);
    const attemptFactor = this.attemptFactor(profile.attempts.average);
    return Math.round(clamp(firstTry + attemptFactor * 30, 0, 100));
  }

  private attemptFactor(averageAttempts: number): number {
    const band = MASTERY_ATTEMPT_BANDS.find((band) => averageAttempts <= band.maxAttempts) ?? MASTERY_ATTEMPT_BANDS.at(-1)!;
    return band.factor;
  }

  private consistency(profile: CandidateProfile): number {
    return Math.round(clamp((profile.signals.commitDays / profile.totalDays) * 100, 0, 100));
  }

  private difficulty(overall: number): Difficulty {
    if (overall >= HARD_THRESHOLD) return "hard";
    if (overall >= MEDIUM_THRESHOLD) return "medium";
    return "easy";
  }
}

export function recommendTopics(profile: CandidateProfile, limit = 4): string[] {
  const topics = profile.weakAreas.slice(0, limit).map((area) => area.title);

  const fallback: string[] = [
    "Multi-Agent Orchestration",
    "Model Context Protocol (MCP)",
    "Fine-Tuning: LoRA & QLoRA",
    "Production Readiness"
  ];
  for (const topic of fallback) {
    if (topics.length >= limit) break;
    if (!topics.includes(topic)) topics.push(topic);
  }

  return topics;
}
