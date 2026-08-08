import type {
  CandidateProfile,
  Curriculum,
  CurriculumDay,
  Difficulty,
  InterviewPlan,
  InterviewStage,
  PlanItem,
  PlanRoadmap,
  QuestionType,
  Seniority
} from "../types/domain.js";
import { unique } from "../utils/text.js";

const PLAN_SIZE = 8;
const MIN_DISTINCT_DAYS = 4;

const ROADMAP: Array<{ stage: InterviewStage; questionType: QuestionType }> = [
  { stage: "Warmup", questionType: "Concept" },
  { stage: "Concept", questionType: "Concept" },
  { stage: "Scenario", questionType: "Scenario" },
  { stage: "Architecture", questionType: "Architecture" },
  { stage: "Tradeoff", questionType: "Tradeoff" },
  { stage: "Production", questionType: "Production" },
  { stage: "Advanced", questionType: "Architecture" },
  { stage: "Reflection", questionType: "Follow-up" }
];

export class InterviewPlanner {
  createPlan(profile: CandidateProfile, curriculum: Curriculum): InterviewPlan {
    const daysByNumber = new Map(curriculum.days.map((day) => [day.day, day]));
    const selectedDays = this.selectDays(profile, curriculum, daysByNumber);
    this.assertInDays(selectedDays);

    const roadmap: PlanRoadmap[] = selectedDays.map((day, position) => ({
      position: position + 1,
      stage: ROADMAP[position].stage,
      questionType: ROADMAP[position].questionType,
      day: day.day,
      dayTitle: day.title,
      difficulty: this.difficultyFor(position, profile.experience.seniority)
    }));

    const items: PlanItem[] = roadmap.map((step, position) => {
      const day = daysByNumber.get(step.day)!;
      return {
        index: position + 1,
        stage: step.stage,
        day,
        objective: this.pickObjective(day, position),
        questionType: step.questionType,
        difficulty: step.difficulty,
        rationale: this.rationaleFor(profile, step.day)
      };
    });

    return {
      totalQuestions: PLAN_SIZE,
      uniqueDays: unique(items.map((item) => item.day.day)),
      roadmap,
      items
    };
  }

  private selectDays(
    profile: CandidateProfile,
    curriculum: Curriculum,
    daysByNumber: Map<number, CurriculumDay>
  ): CurriculumDay[] {
    const completedDayNumbers = [...profile.completedDays].sort((a, b) => a - b);
    const strengthDays = profile.strengths.map((strength) => strength.day);
    const weakDays = profile.weakAreas.map((area) => area.day);
    const explored = new Set([...completedDayNumbers, ...weakDays]);

    const completedOrdered = unique([...strengthDays, ...completedDayNumbers]);
    const remainingOrdered = curriculum.days
      .filter((day) => !explored.has(day.day))
      .map((day) => day.day)
      .sort((a, b) => a - b);

    const orderedDayNumbers = unique([...completedOrdered, ...weakDays, ...remainingOrdered]).slice(0, PLAN_SIZE);
    return orderedDayNumbers.map((dayNumber) => daysByNumber.get(dayNumber)!);
  }

  private assertInDays(selected: CurriculumDay[]): void {
    if (selected.length < PLAN_SIZE) {
      throw new Error(`Interview plan requires ${PLAN_SIZE} topics but only ${selected.length} curriculum days are available.`);
    }
    if (new Set(selected.map((day) => day.day)).size < MIN_DISTINCT_DAYS) {
      throw new Error(`Interview plan must cover at least ${MIN_DISTINCT_DAYS} distinct curriculum days.`);
    }
  }

  private difficultyFor(position: number, seniority: Seniority): Difficulty {
    if (position >= 5) return "hard";
    if (position >= 2) return "medium";
    return seniority === "senior" ? "medium" : "easy";
  }

  private rationaleFor(profile: CandidateProfile, dayNumber: number): string {
    const weakArea = profile.weakAreas.find((area) => area.day === dayNumber);
    if (weakArea) {
      const reason =
        weakArea.reason === "failed"
          ? "was not completed; probe fundamentals before deepening"
          : weakArea.reason === "struggled"
            ? `needed ${weakArea.attempts} attempts; probe understanding before increasing difficulty`
            : "was skipped; verify the material was self-studied";
      return `Day ${dayNumber} ${reason}.`;
    }
    if (profile.strengths.some((strength) => strength.day === dayNumber)) {
      return `Day ${dayNumber} was completed on the first attempt; use it to test depth and transfer.`;
    }
    if (profile.completedDays.includes(dayNumber)) {
      return `Day ${dayNumber} was completed; reinforce it before moving on.`;
    }
    return `Day ${dayNumber} rounds out end-to-end AI engineering readiness.`;
  }

  private pickObjective(day: CurriculumDay, position: number): string {
    return day.objectives[position % day.objectives.length];
  }
}