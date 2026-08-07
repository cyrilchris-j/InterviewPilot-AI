import type { Feedback, InterviewSession } from "../types/domain.js";
import { average, unique } from "../utils/text.js";

export class FeedbackGenerator {
  generate(session: InterviewSession): Feedback {
    const turns = session.turns;
    const avg = Number(average(turns.map((turn) => turn.evaluation.score)).toFixed(1));
    const strengths = unique(turns.flatMap((turn) => turn.evaluation.detectedStrengths)).slice(0, 5);
    const gaps = unique(turns.flatMap((turn) => turn.evaluation.detectedGaps)).slice(0, 5);
    const weakerTurns = [...turns].sort((a, b) => a.evaluation.score - b.evaluation.score).slice(0, 3);
    const strongerTurns = [...turns].sort((a, b) => b.evaluation.score - a.evaluation.score).slice(0, 3);

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

    const fallbackStrengths = strongerTurns.map(
      (turn) => `Strongest signal on Day ${turn.question.day}: ${turn.question.dayTitle}.`
    );
    const fallbackGaps = weakerTurns.map((turn) => `Deepen practical examples for Day ${turn.question.day}: ${turn.question.dayTitle}.`);

    return {
      summary: `${session.candidate.member.name} completed an adaptive ${turns.length}-question interview across ${unique(turns.map((turn) => turn.question.day)).length} curriculum days with an average score of ${avg}/5. The strongest answers showed ${avg >= 3.7 ? "solid readiness for applied AI engineering conversations" : "emerging understanding with clear areas to strengthen before production-level interviews"}.`,
      strengths: strengths.length ? strengths : fallbackStrengths,
      gaps: gaps.length ? gaps : fallbackGaps,
      next: [
        "Practice answering with a concrete system, metric, and failure mode.",
        "Use the curriculum objectives as a checklist before moving into architecture tradeoffs.",
        "Run one timed mock interview focused on the recommended days."
      ],
      topicScores,
      recommendedDays,
      learningPath,
      overallRating: avg >= 4.2 ? "Excellent" : avg >= 3.5 ? "Strong" : avg >= 2.8 ? "Developing" : "Needs Focus"
    };
  }
}
