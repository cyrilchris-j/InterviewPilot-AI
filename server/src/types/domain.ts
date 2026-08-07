export type CurriculumModule = {
  n: number;
  title: string;
  days: number[];
};

export type CurriculumDay = {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
};

export type Curriculum = {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
};

export type CandidateMission = {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
};

export type Candidate = {
  member: {
    id: string;
    name: string;
    jobRole: string;
    yearsExperience: number;
    education: string;
    status: string;
  };
  missions: CandidateMission[];
  signals: {
    commitDays: number;
    missionsCompleted: number;
    missionsFirstTry: number;
  };
};

export type CandidateCatalog = {
  candidates: Candidate[];
};

export type CandidateAnalysis = {
  id: string;
  name: string;
  role: string;
  seniority: "emerging" | "mid" | "senior";
  completedDays: number[];
  skippedDays: number[];
  strongDays: number[];
  weakDays: number[];
  confidence: number;
  averageAttempts: number;
  riskNotes: string[];
};

export type Difficulty = "easy" | "medium" | "hard";

export type InterviewStage =
  | "Warmup"
  | "Intermediate"
  | "Advanced"
  | "Scenario"
  | "Architecture"
  | "Tradeoff"
  | "Production"
  | "Reflection";

export type QuestionType =
  | "Definition"
  | "Concept"
  | "Architecture"
  | "Scenario"
  | "Debugging"
  | "Tradeoff"
  | "Production"
  | "Best Practices"
  | "Failure Analysis"
  | "Follow-up";

export type PlanItem = {
  index: number;
  stage: InterviewStage;
  day: CurriculumDay;
  objective: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  rationale: string;
};

export type InterviewPlan = {
  totalQuestions: number;
  uniqueDays: number[];
  items: PlanItem[];
};

export type InterviewQuestion = {
  id: string;
  index: number;
  text: string;
  day: number;
  dayTitle: string;
  objective: string;
  stage: InterviewStage;
  type: QuestionType;
  difficulty: Difficulty;
};

export type AnswerEvaluation = {
  correctness: number;
  depth: number;
  confidence: number;
  practicalUnderstanding: number;
  communication: number;
  reasoning: number;
  productionThinking: number;
  architectureThinking: number;
  score: number;
  verdict: "strong" | "mixed" | "weak";
  evidence: string;
  followUpHint: string;
  detectedStrengths: string[];
  detectedGaps: string[];
};

export type InterviewTurn = {
  question: InterviewQuestion;
  answer: string;
  evaluation: AnswerEvaluation;
};

export type Feedback = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  topicScores: { topic: string; score: number; day: number }[];
  recommendedDays: number[];
  learningPath: string[];
  overallRating: string;
};

export type InterviewSession = {
  sessionId: string;
  candidate: Candidate;
  analysis: CandidateAnalysis;
  plan: InterviewPlan;
  currentQuestion?: InterviewQuestion;
  currentIndex: number;
  turns: InterviewTurn[];
  askedQuestionKeys: Set<string>;
  createdAt: string;
  updatedAt: string;
  done: boolean;
};
