import type { AnswerEvaluation, Difficulty } from "../types/domain.js";

export class DifficultyAdapter {
  nextDifficulty(current: Difficulty, evaluation?: AnswerEvaluation): Difficulty {
    if (!evaluation) return current;
    if (evaluation.score >= 4.1) {
      return current === "easy" ? "medium" : "hard";
    }
    if (evaluation.score <= 2.5) {
      return current === "hard" ? "medium" : "easy";
    }
    return current;
  }
}
