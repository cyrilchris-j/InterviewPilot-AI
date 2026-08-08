import type { Candidate, Feedback, InterviewQuestion } from "./domain.js";

export type InterviewRequest = {
  sessionId: string;
  candidate?: Candidate;
  candidateId?: string;
  message?: string;
  action?: "catalog" | "reset";
};

export type InterviewResponse = {
  reply: string;
  done: boolean;
  sessionId?: string;
  question?: InterviewQuestion;
  progress?: {
    answered: number;
    total: number;
    percent: number;
    coveredDays: number[];
  };
  metrics?: {
    latestScore: number;
    confidence: number;
    difficulty: string;
  };
  feedback?: Feedback;
  candidates?: Array<{
    id: string;
    name: string;
    role: string;
    yearsExperience: number;
    completed: number;
    firstTry: number;
  }>;
  curriculumDays?: Array<{ day: number; title: string; type: string }>;
  /** Full interview plan returned on session start so the frontend can show real plan data */
  interviewPlan?: {
    totalQuestions: number;
    uniqueDays: number[];
    roadmap: Array<{
      position: number;
      day: number;
      dayTitle: string;
      stage: string;
      questionType: string;
      difficulty: string;
      rationale: string;
      module: string;
    }>;
  };
  /** Candidate intelligence summary returned on session start */
  candidateAnalysis?: {
    completedDays: number[];
    skippedDays: number[];
    strongDays: number[];
    weakDays: number[];
    difficulty: string;
    confidence: number;
    averageAttempts: number;
  };
};
