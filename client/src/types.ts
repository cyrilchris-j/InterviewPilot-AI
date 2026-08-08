export type Mission = {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
};

export type CandidateDetail = {
  id: string;
  name: string;
  role: string;
  yearsExperience: number;
  education: string;
  status: string;
  missions: Mission[];
  signals: {
    commitDays: number;
    missionsCompleted: number;
    missionsFirstTry: number;
  };
};

// Lightweight summary still used for listing
export type CandidateSummary = {
  id: string;
  name: string;
  role: string;
  yearsExperience: number;
  completed: number;
  firstTry: number;
};

export type Question = {
  id: string;
  index: number;
  text: string;
  day: number;
  dayTitle: string;
  objective: string;
  stage: string;
  type: string;
  difficulty: string;
};

export type Feedback = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  topicScores: { topic: string; day: number; score: number }[];
  recommendedDays: number[];
  learningPath: string[];
  overallRating: string;
};

export type InterviewPlan = {
  totalQuestions: number;
  uniqueDays: number[];
  roadmap: Array<{
    position: number;
    day: number;
    dayTitle: string;
    stage: string;
    questionType: string;
    difficulty: string;
    module: string;
    rationale: string;
  }>;
};

export type CandidateAnalysisSummary = {
  completedDays: number[];
  skippedDays: number[];
  strongDays: number[];
  weakDays: number[];
  difficulty: string;
  confidence: number;
  averageAttempts: number;
};

export type InterviewResponse = {
  reply: string;
  done: boolean;
  sessionId?: string;
  question?: Question;
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
  candidates?: CandidateSummary[];
  candidateDetails?: CandidateDetail[];
  curriculumDays?: { day: number; title: string; type: string }[];
  /** Real interview plan returned on session start */
  interviewPlan?: InterviewPlan;
  /** Real candidate analysis returned on session start */
  candidateAnalysis?: CandidateAnalysisSummary;
};

export type TranscriptTurn = {
  speaker: "pilot" | "candidate";
  text: string;
};
