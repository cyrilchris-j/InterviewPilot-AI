import type {
  CandidateAnalysis,
  Curriculum,
  CurriculumDay,
  Difficulty,
  InterviewPlan,
  InterviewStage,
  PlanItem,
  QuestionType
} from "../types/domain.js";
import { unique } from "../utils/text.js";

const stages: InterviewStage[] = [
  "Warmup",
  "Intermediate",
  "Advanced",
  "Scenario",
  "Architecture",
  "Tradeoff",
  "Production",
  "Reflection"
];

const types: QuestionType[] = [
  "Concept",
  "Debugging",
  "Architecture",
  "Scenario",
  "Architecture",
  "Tradeoff",
  "Production",
  "Follow-up"
];

export class InterviewPlanner {
  createPlan(curriculum: Curriculum, analysis: CandidateAnalysis): InterviewPlan {
    const daysByNumber = new Map(curriculum.days.map((day) => [day.day, day]));
    const preferred = [7, 10, 12, 13, 16, 18, 20, 22, 23, 28, 29, 31];
    const candidateWeak = analysis.weakDays.filter((day) => daysByNumber.has(day));
    const candidateStrong = analysis.strongDays.filter((day) => daysByNumber.has(day));
    const skipped = new Set(analysis.skippedDays);

    const orderedDayNumbers = unique([...candidateWeak, ...preferred, ...candidateStrong])
      .filter((day) => daysByNumber.has(day))
      .filter((day) => !(skipped.has(23) && day === 23));

    if (!orderedDayNumbers.includes(10) && daysByNumber.has(10)) {
      orderedDayNumbers.unshift(10);
    }

    const selected: CurriculumDay[] = [];
    for (const dayNumber of orderedDayNumbers) {
      const day = daysByNumber.get(dayNumber);
      if (day) {
        selected.push(day);
      }
      if (selected.length >= 8) {
        break;
      }
    }

    while (selected.length < 8) {
      const next = curriculum.days.find((day) => !selected.some((chosen) => chosen.day === day.day) && !skipped.has(day.day));
      if (!next) {
        break;
      }
      selected.push(next);
    }

    const items: PlanItem[] = selected.slice(0, 8).map((day, position) => ({
      index: position + 1,
      stage: stages[position],
      day,
      objective: day.objectives[position % day.objectives.length],
      questionType: types[position],
      difficulty: this.initialDifficulty(position, analysis),
      rationale: this.rationale(day, analysis)
    }));

    return {
      totalQuestions: 8,
      uniqueDays: unique(items.map((item) => item.day.day)),
      items
    };
  }

  private initialDifficulty(position: number, analysis: CandidateAnalysis): Difficulty {
    if (position < 2) return "easy";
    if (analysis.seniority === "senior" && position >= 4) return "hard";
    if (analysis.confidence <= 4 && position < 5) return "medium";
    return position >= 5 ? "hard" : "medium";
  }

  private rationale(day: CurriculumDay, analysis: CandidateAnalysis): string {
    if (analysis.weakDays.includes(day.day)) {
      return `Candidate needed extra support on Day ${day.day}; probe understanding before increasing difficulty.`;
    }
    if (analysis.strongDays.includes(day.day)) {
      return `Candidate completed Day ${day.day} quickly; use it to test depth and transfer.`;
    }
    return `Day ${day.day} is important for validating end-to-end AI engineering readiness.`;
  }
}
