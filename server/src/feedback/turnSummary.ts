import type { Feedback, InterviewTurn } from "../types/domain.js";
import { unique } from "../utils/text.js";

export type TurnSummary = {
  topicScores: Feedback["topicScores"];
  recommendedDays: number[];
  learningPath: string[];
};

const WEAK_TURN_LIMIT = 3;

export function summarizeTurns(turns: readonly InterviewTurn[]): TurnSummary {
  const weakerTurns = [...turns]
    .sort((a, b) => a.evaluation.score - b.evaluation.score)
    .slice(0, WEAK_TURN_LIMIT);

  const topicScores = turns.map((turn) => ({
    topic: turn.question.dayTitle,
    day: turn.question.day,
    score: turn.evaluation.score
  }));

  const recommendedDays = unique(weakerTurns.map((turn) => turn.question.day));

  const learningPath = recommendedDays.map((day) => {
    const turn = weakerTurns.find((item) => item.question.day === day);
    return `Revisit Day ${day}: ${turn?.question.dayTitle ?? "curriculum topic"} with emphasis on ${turn?.question.objective ?? "applied practice"}.`;
  });

  return { topicScores, recommendedDays, learningPath };
}
