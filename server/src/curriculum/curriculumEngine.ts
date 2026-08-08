import type {
  Candidate,
  CurriculumDay,
  CurriculumModule,
  CurriculumTopic,
  Difficulty,
  InterviewStage,
  QuestionPoolItem,
  QuestionType,
  TopicStatus
} from "../types/domain.js";
import { AppError } from "../errors/AppError.js";
import { CurriculumRepository } from "./curriculumRepository.js";

export type NextTopicsOptions = {
  limit?: number;
  prioritize?: number[];
  includeCompleted?: boolean;
  excludeDays?: number[];
};

export type QuestionPoolOptions = {
  dayNumbers?: number[];
  moduleNumber?: number;
  difficulty?: Difficulty;
  limit?: number;
};

const STAGES: InterviewStage[] = [
  "Warmup",
  "Intermediate",
  "Advanced",
  "Scenario",
  "Architecture",
  "Tradeoff",
  "Production",
  "Reflection"
];

const TYPES: QuestionType[] = [
  "Concept",
  "Debugging",
  "Architecture",
  "Scenario",
  "Tradeoff",
  "Production",
  "Best Practices",
  "Follow-up"
];

const TYPE_RANK: Record<string, number> = {
  CAPSTONE: 0,
  SHIP_IT: 1,
  AI_CORE: 2,
  OPTIMIZE: 3,
  BUILD: 4,
  LEARN: 5,
  SETUP: 6
};

const STATUS_RANK: Record<TopicStatus, number> = {
  failed: 0,
  skipped: 1,
  pending: 2,
  completed: 3
};

export class CurriculumEngine {
  private readonly modules: CurriculumModule[];
  private readonly dayMap: Map<number, CurriculumDay>;
  private readonly moduleForDay: Map<number, CurriculumModule>;

  constructor(private readonly repository: CurriculumRepository = new CurriculumRepository()) {
    const curriculum = this.repository.getAll();
    this.modules = curriculum.modules;
    this.dayMap = new Map(curriculum.days.map((day) => [day.day, day]));
    this.moduleForDay = new Map(
      curriculum.modules.flatMap((module) =>
        this.expandDays(module.days).map((dayNumber) => [dayNumber, module])
      )
    );
  }

  getDay(dayNumber: number): CurriculumDay {
    const day = this.dayMap.get(dayNumber);
    if (!day) {
      throw new AppError(`Curriculum day ${dayNumber} was not found.`, 404, "DAY_NOT_FOUND");
    }
    return day;
  }

  getModule(moduleNumber: number): CurriculumModule {
    const module = this.modules.find((item) => item.n === moduleNumber);
    if (!module) {
      throw new AppError(`Curriculum module ${moduleNumber} was not found.`, 404, "MODULE_NOT_FOUND");
    }
    return module;
  }

  getModuleForDay(dayNumber: number): CurriculumModule | undefined {
    return this.moduleForDay.get(dayNumber);
  }

  getObjectives(dayNumber: number): string[] {
    return this.getDay(dayNumber).objectives;
  }

  getTools(dayNumber: number): string[] {
    return this.getDay(dayNumber).tools;
  }

  getCompletedTopics(candidate: Candidate): CurriculumTopic[] {
    return this.allTopics(candidate).filter((topic) => topic.status === "completed");
  }

  getNextTopics(candidate: Candidate, options: NextTopicsOptions = {}): CurriculumTopic[] {
    const { limit = 5, prioritize = [], includeCompleted = false, excludeDays = [] } = options;

    const excluded = new Set(excludeDays);
    const prioritized = new Set(prioritize);

    return this.allTopics(candidate)
      .filter((topic) => !excluded.has(topic.day))
      .filter((topic) => includeCompleted || topic.status !== "completed")
      .sort((a, b) => this.topicOrder(a, b, prioritized))
      .slice(0, limit);
  }

  getQuestionPool(options: QuestionPoolOptions = {}): QuestionPoolItem[] {
    const { dayNumbers, moduleNumber, difficulty, limit } = options;
    const dayFilter = dayNumbers ? new Set(dayNumbers) : null;
    const pool: QuestionPoolItem[] = [];

    for (const day of this.repository.getDays()) {
      if (dayFilter && !dayFilter.has(day.day)) continue;
      const module = this.getModuleForDay(day.day);
      if (moduleNumber !== undefined && module?.n !== moduleNumber) continue;

      for (const objective of day.objectives) {
        pool.push({
          day: day.day,
          dayTitle: day.title,
          module: module?.title ?? "",
          objective,
          type: TYPES[pool.length % TYPES.length],
          stage: STAGES[pool.length % STAGES.length],
          difficulty: difficulty ?? this.difficultyFor(module)
        });
      }
    }

    return typeof limit === "number" ? pool.slice(0, limit) : pool;
  }

  private allTopics(candidate: Candidate): CurriculumTopic[] {
    const completed = new Set(candidate.missions.filter((mission) => mission.passed).map((mission) => mission.day));
    const failed = new Set(
      candidate.missions.filter((mission) => !mission.passed && !mission.skipped).map((mission) => mission.day)
    );
    const skipped = new Set(candidate.missions.filter((mission) => mission.skipped).map((mission) => mission.day));

    return this.repository.getDays().map((day) => ({
      day: day.day,
      title: day.title,
      type: day.type,
      moduleNumber: this.getModuleForDay(day.day)?.n ?? 0,
      moduleTitle: this.getModuleForDay(day.day)?.title ?? "",
      objectives: day.objectives,
      tools: day.tools,
      status: this.statusOf(day.day, completed, failed, skipped)
    }));
  }

  private topicOrder(topicA: CurriculumTopic, topicB: CurriculumTopic, prioritized: Set<number>): number {
    const rankA = this.rankOf(topicA, prioritized);
    const rankB = this.rankOf(topicB, prioritized);
    if (rankA !== rankB) return rankA - rankB;

    const importanceA = TYPE_RANK[topicA.type] ?? 99;
    const importanceB = TYPE_RANK[topicB.type] ?? 99;
    if (importanceA !== importanceB) return importanceA - importanceB;

    if (topicA.moduleNumber !== topicB.moduleNumber) return topicA.moduleNumber - topicB.moduleNumber;
    return topicA.day - topicB.day;
  }

  private rankOf(topic: CurriculumTopic, prioritized: Set<number>): number {
    if (prioritized.has(topic.day)) return -1;
    return STATUS_RANK[topic.status];
  }

  private statusOf(dayNumber: number, completed: Set<number>, failed: Set<number>, skipped: Set<number>): TopicStatus {
    if (completed.has(dayNumber)) return "completed";
    if (failed.has(dayNumber)) return "failed";
    if (skipped.has(dayNumber)) return "skipped";
    return "pending";
  }

  private expandDays(dayNumbers: number[]): number[] {
    const first = dayNumbers[0];
    const last = dayNumbers[dayNumbers.length - 1];
    const expanded: number[] = [];
    for (let day = first; day <= last; day += 1) {
      expanded.push(day);
    }
    return expanded;
  }

  private difficultyFor(module: CurriculumModule | undefined): Difficulty {
    if (!module) return "medium";
    const total = this.modules.length;
    const lowBound = Math.max(1, Math.ceil(total / 3));
    const highBound = Math.max(lowBound + 1, Math.ceil((total * 2) / 3));
    if (module.n <= lowBound) return "easy";
    if (module.n <= highBound) return "medium";
    return "hard";
  }
}
