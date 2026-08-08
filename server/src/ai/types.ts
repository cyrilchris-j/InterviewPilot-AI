import type {
  AnswerEvaluation,
  CandidateAnalysis,
  CurriculumDay,
  Difficulty,
  Feedback,
  InterviewStage,
  InterviewQuestion,
  InterviewTurn,
  QuestionType
} from "../types/domain.js";
import type { QuestionOutput } from "./schemas.js";

export type QuestionServiceInput = {
  candidate: CandidateAnalysis;
  day: CurriculumDay;
  objective: string;
  stage: InterviewStage;
  questionType: QuestionType;
  difficulty: Difficulty;
  previousEvaluation?: AnswerEvaluation;
  previousAnswer?: string;
  askedQuestions: readonly string[];
};

export type EvaluationServiceInput = {
  candidate: CandidateAnalysis;
  question: InterviewQuestion;
  answer: string;
};

export type FeedbackServiceInput = {
  candidate: CandidateAnalysis;
  turns: readonly InterviewTurn[];
};

export interface QuestionAIService {
  generate(input: QuestionServiceInput): Promise<QuestionOutput>;
}

export interface EvaluationAIService {
  evaluate(input: EvaluationServiceInput): Promise<AnswerEvaluation>;
}

export interface FeedbackAIService {
  generate(input: FeedbackServiceInput): Promise<Feedback>;
}

export type AiServices = {
  question: QuestionAIService;
  evaluation: EvaluationAIService;
  feedback: FeedbackAIService;
};
