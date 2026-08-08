import type { Feedback, InterviewSession, InterviewTurn } from "../types/domain.js";
import { average, unique } from "../utils/text.js";
import { summarizeTurns } from "./turnSummary.js";

export class FeedbackGenerator {
  generate(session: InterviewSession): Feedback {
    const turns = session.memory.history;
    const avg = Number(average(turns.map((turn) => turn.evaluation.score)).toFixed(1));
    const strengths = unique(turns.flatMap((turn) => turn.evaluation.detectedStrengths)).slice(0, 5);
    const gaps = unique(turns.flatMap((turn) => turn.evaluation.detectedGaps)).slice(0, 5);
    const strongerTurns = [...turns].sort((a, b) => b.evaluation.score - a.evaluation.score).slice(0, 3);

    const { topicScores, recommendedDays, learningPath } = summarizeTurns(turns);

    const fallbackStrengths = strongerTurns.map(
      (turn) => `Day ${turn.question.day} — ${turn.question.dayTitle}: demonstrated solid understanding in this area.`
    );
    const fallbackGaps = weakerGaps(turns);

    // Build curriculum-linked next[] from actual weak areas
    const curriculumNext = buildCurriculumNext(turns, recommendedDays, learningPath);

    return {
      summary: buildSummary(session.candidate.member.name, turns, avg),
      strengths: strengths.length ? strengths : fallbackStrengths,
      gaps: gaps.length ? gaps : fallbackGaps,
      next: curriculumNext,
      topicScores,
      recommendedDays,
      learningPath,
      overallRating: avg >= 4.2 ? "Excellent" : avg >= 3.5 ? "Strong" : avg >= 2.8 ? "Developing" : "Needs Focus"
    };
  }
}

function buildSummary(name: string, turns: readonly InterviewTurn[], avg: number): string {
  const days = unique(turns.map((t) => t.question.day));
  const topicList = days.slice(0, 3).map((d) => {
    const turn = turns.find((t) => t.question.day === d);
    return turn ? turn.question.dayTitle : `Day ${d}`;
  }).join(", ");

  const readiness = avg >= 4.2
    ? "demonstrates strong readiness for production AI engineering"
    : avg >= 3.5
      ? "shows solid foundational understanding with some areas to deepen"
      : avg >= 2.8
        ? "shows emerging understanding with clear areas to strengthen before production work"
        : "needs to revisit core curriculum areas before advancing to senior-level scenarios";

  return `${name} completed a ${turns.length}-question adaptive interview covering ${days.length} curriculum days, including ${topicList}. ` +
    `With an average score of ${avg}/5, the candidate ${readiness}. ` +
    `The areas below provide a clear curriculum-linked roadmap for continued growth.`;
}

/** Build next[] steps from actual learningPath or fallback to generic curriculum advice */
function buildCurriculumNext(
  turns: readonly InterviewTurn[],
  recommendedDays: number[],
  learningPath: string[]
): string[] {
  // Primary: use learning path entries (already curriculum-linked from turnSummary)
  if (learningPath.length >= 3) return learningPath.slice(0, 4);

  // Secondary: build from actual weak turns
  const weakTurns = [...turns]
    .sort((a, b) => a.evaluation.score - b.evaluation.score)
    .slice(0, 3);

  if (weakTurns.length > 0) {
    return weakTurns.map((turn) =>
      `Day ${turn.question.day} — ${turn.question.dayTitle}: Review the learning objectives and complete a hands-on exercise focused on "${turn.question.objective.slice(0, 80)}".`
    );
  }

  // Fallback: use recommended days if they exist
  if (recommendedDays.length > 0) {
    return recommendedDays.slice(0, 3).map((day) =>
      `Day ${day}: Revisit this curriculum day and complete a practical exercise to solidify your understanding.`
    );
  }

  // Last resort: tie to covered topics
  const coveredDays = unique(turns.map((t) => t.question.day));
  return coveredDays.slice(0, 3).map((day) => {
    const turn = turns.find((t) => t.question.day === day);
    return `Day ${day} — ${turn?.question.dayTitle ?? "Curriculum Topic"}: Build a working implementation to validate your theoretical understanding.`;
  });
}

function weakerGaps(turns: readonly InterviewTurn[]): string[] {
  return [...turns]
    .sort((a, b) => a.evaluation.score - b.evaluation.score)
    .slice(0, 3)
    .map((turn) => `Day ${turn.question.day} — ${turn.question.dayTitle}: Needs deeper practical grounding.`);
}
