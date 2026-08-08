import type {
  CandidateProfile,
  Curriculum,
  CurriculumDay,
  Difficulty,
  InterviewPlan,
  InterviewStage,
  InterviewUserProfile,
  PlanItem,
  PlanRoadmap,
  QuestionType,
  Seniority
} from "../types/domain.js";
import { unique } from "../utils/text.js";

const PLAN_SIZE = 8;
const MIN_DISTINCT_DAYS = 4;

const DEFAULT_ROADMAP: Array<{ stage: InterviewStage; questionType: QuestionType }> = [
  { stage: "Warmup", questionType: "Concept" },
  { stage: "Concept", questionType: "Concept" },
  { stage: "Scenario", questionType: "Scenario" },
  { stage: "Architecture", questionType: "Architecture" },
  { stage: "Tradeoff", questionType: "Tradeoff" },
  { stage: "Production", questionType: "Production" },
  { stage: "Advanced", questionType: "Architecture" },
  { stage: "Reflection", questionType: "Follow-up" }
];

/** Style-biased roadmaps for onboarding interview-type preferences. */
const STYLE_ROADMAPS: Record<string, Array<{ stage: InterviewStage; questionType: QuestionType }>> = {
  Technical: DEFAULT_ROADMAP,
  Behavioral: [
    { stage: "Warmup", questionType: "Concept" },
    { stage: "Scenario", questionType: "Scenario" },
    { stage: "Scenario", questionType: "Scenario" },
    { stage: "Tradeoff", questionType: "Tradeoff" },
    { stage: "Production", questionType: "Production" },
    { stage: "Scenario", questionType: "Failure Analysis" },
    { stage: "Reflection", questionType: "Follow-up" },
    { stage: "Reflection", questionType: "Follow-up" }
  ],
  "System Design": [
    { stage: "Warmup", questionType: "Concept" },
    { stage: "Architecture", questionType: "Architecture" },
    { stage: "Architecture", questionType: "Architecture" },
    { stage: "Tradeoff", questionType: "Tradeoff" },
    { stage: "Production", questionType: "Production" },
    { stage: "Advanced", questionType: "Architecture" },
    { stage: "Scenario", questionType: "Scenario" },
    { stage: "Reflection", questionType: "Follow-up" }
  ],
  Coding: [
    { stage: "Warmup", questionType: "Concept" },
    { stage: "Scenario", questionType: "Scenario" },
    { stage: "Scenario", questionType: "Debugging" },
    { stage: "Architecture", questionType: "Architecture" },
    { stage: "Production", questionType: "Production" },
    { stage: "Scenario", questionType: "Debugging" },
    { stage: "Tradeoff", questionType: "Tradeoff" },
    { stage: "Reflection", questionType: "Follow-up" }
  ],
  Mixed: DEFAULT_ROADMAP
};

export class InterviewPlanner {
  createPlan(
    profile: CandidateProfile,
    curriculum: Curriculum,
    userProfile?: InterviewUserProfile
  ): InterviewPlan {
    const daysByNumber = new Map(curriculum.days.map((day) => [day.day, day]));
    const moduleByDay = new Map<number, string>();
    for (const module of curriculum.modules) {
      const [start, end] = module.days;
      for (let d = start; d <= end; d++) {
        moduleByDay.set(d, module.title);
      }
    }

    const selectedDays = this.selectDays(profile, curriculum, daysByNumber);
    this.assertInDays(selectedDays);

    const styleKey = userProfile?.interviewType ?? "Mixed";
    const roadmapTemplate = STYLE_ROADMAPS[styleKey] ?? DEFAULT_ROADMAP;
    const difficultyBias = this.difficultyBias(userProfile?.difficulty);

    const roadmap: PlanRoadmap[] = selectedDays.map((day, position) => ({
      position: position + 1,
      stage: roadmapTemplate[position].stage,
      questionType: roadmapTemplate[position].questionType,
      day: day.day,
      dayTitle: day.title,
      difficulty: this.difficultyFor(position, profile.experience.seniority, difficultyBias),
      module: moduleByDay.get(day.day) ?? "General",
      rationale: this.rationaleFor(profile, day.day, userProfile)
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
        rationale: step.rationale
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

  private difficultyBias(preference?: string): number {
    switch (preference) {
      case "Easy":
        return -1;
      case "Hard":
      case "Senior":
        return 1;
      case "Staff":
        return 2;
      default:
        return 0;
    }
  }

  private difficultyFor(position: number, seniority: Seniority, bias = 0): Difficulty {
    const levels: Difficulty[] = ["easy", "medium", "hard"];
    let base = 0;
    if (position >= 5) base = 2;
    else if (position >= 2) base = 1;
    else base = seniority === "senior" ? 1 : 0;
    return levels[Math.max(0, Math.min(2, base + bias))];
  }

  private rationaleFor(
    profile: CandidateProfile,
    dayNumber: number,
    userProfile?: InterviewUserProfile
  ): string {
    const target =
      userProfile?.company && userProfile?.targetRole
        ? ` Calibrate for a ${userProfile.targetRole} bar at ${userProfile.company}.`
        : "";
    const weakArea = profile.weakAreas.find((area) => area.day === dayNumber);
    if (weakArea) {
      const reason =
        weakArea.reason === "failed"
          ? "was not completed; probe fundamentals before deepening"
          : weakArea.reason === "struggled"
            ? `needed ${weakArea.attempts} attempts; probe understanding before increasing difficulty`
            : "was skipped; verify the material was self-studied";
      return `Day ${dayNumber} ${reason}.${target}`;
    }
    if (profile.strengths.some((strength) => strength.day === dayNumber)) {
      return `Day ${dayNumber} was completed on the first attempt; use it to test depth and transfer.${target}`;
    }
    if (profile.completedDays.includes(dayNumber)) {
      return `Day ${dayNumber} was completed; reinforce it before moving on.${target}`;
    }
    return `Day ${dayNumber} rounds out end-to-end AI engineering readiness.${target}`;
  }

  private pickObjective(day: CurriculumDay, position: number): string {
    return day.objectives[position % day.objectives.length];
  }
}