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

export type TopicStatus = "completed" | "failed" | "skipped" | "pending";

export type CurriculumTopic = {
  day: number;
  title: string;
  type: string;
  moduleNumber: number;
  moduleTitle: string;
  objectives: string[];
  tools: string[];
  status: TopicStatus;
};

export type QuestionPoolItem = {
  day: number;
  dayTitle: string;
  module: string;
  objective: string;
  type: QuestionType;
  stage: InterviewStage;
  difficulty: Difficulty;
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

export type Seniority = "emerging" | "mid" | "senior";

export type ModuleProgress = {
  moduleNumber: number;
  title: string;
  days: number[];
  completedDays: number[];
  skippedDays: number[];
  failedDays: number[];
  completionRate: number;
};

export type CandidateProfile = {
  totalDays: number;
  completedDays: number[];
  skippedDays: number[];
  failedDays: number[];
  attempts: {
    passed: number[];
    average: number;
    firstTryRate: number;
  };
  signals: {
    commitDays: number;
    missionsCompleted: number;
    missionsFirstTry: number;
  };
  strengths: Array<{ day: number; title: string }>;
  weakAreas: Array<{ day: number; title: string; reason: "skipped" | "failed" | "struggled"; attempts?: number }>;
  experience: {
    years: number;
    seniority: Seniority;
  };
  completedModules: ModuleProgress[];
};

export type CandidateScore = {
  completion: number;
  mastery: number;
  consistency: number;
  overall: number;
  confidence: number;
  difficulty: Difficulty;
};

export type CandidateAnalysis = {
  id: string;
  name: string;
  role: string;
  seniority: Seniority;
  completedDays: number[];
  skippedDays: number[];
  strongDays: number[];
  weakDays: number[];
  averageAttempts: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  difficulty: Difficulty;
  riskNotes: string[];
};

export type Difficulty = "easy" | "medium" | "hard";

export type InterviewStage =
  | "Warmup"
  | "Intermediate"
  | "Advanced"
  | "Concept"
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

export type PlanRoadmap = {
  position: number;
  stage: InterviewStage;
  questionType: QuestionType;
  day: number;
  dayTitle: string;
  difficulty: Difficulty;
};

export type InterviewPlan = {
  totalQuestions: number;
  uniqueDays: number[];
  roadmap: PlanRoadmap[];
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
