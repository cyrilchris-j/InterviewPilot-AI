import type { Candidate, Feedback, InterviewQuestion, InterviewSession } from "../types/domain.js";
import type { InterviewResponse } from "../types/api.js";
import { CandidateAnalyzer } from "../services/candidateAnalyzer.js";
import { InterviewPlanner } from "../planner/interviewPlanner.js";
import { QuestionGenerator } from "./questionGenerator.js";
import { AnswerEvaluator } from "../evaluation/answerEvaluator.js";
import { DifficultyAdapter } from "./difficultyAdapter.js";
import { FeedbackGenerator } from "../feedback/feedbackGenerator.js";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { SessionMemory } from "../memory/sessionMemory.js";

export class InterviewEngine {
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly memory: SessionMemory,
    private readonly analyzer = new CandidateAnalyzer(),
    private readonly planner = new InterviewPlanner(),
    private readonly questionGenerator = new QuestionGenerator(),
    private readonly evaluator = new AnswerEvaluator(),
    private readonly difficultyAdapter = new DifficultyAdapter(),
    private readonly feedbackGenerator = new FeedbackGenerator()
  ) {}

  start(sessionId: string, candidate: Candidate): InterviewResponse {
    const analysis = this.analyzer.analyze(candidate);
    const plan = this.planner.createPlan(this.curriculumRepository.getAll(), analysis);
    const session: InterviewSession = {
      sessionId,
      candidate,
      analysis,
      plan,
      currentIndex: 0,
      turns: [],
      askedQuestionKeys: new Set(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      done: false
    };

    const firstQuestion = this.questionGenerator.generate(plan.items[0], session.askedQuestionKeys);
    session.currentQuestion = firstQuestion;
    this.memory.set(session);

    return {
      reply: `Welcome, ${candidate.member.name}. I will tailor this interview to your cohort journey. Question 1 of ${plan.totalQuestions}: ${firstQuestion.text}`,
      done: false,
      sessionId,
      question: firstQuestion,
      progress: this.progress(session),
      metrics: { latestScore: 0, confidence: analysis.confidence, difficulty: firstQuestion.difficulty }
    };
  }

  answer(sessionId: string, message: string): InterviewResponse {
    const session = this.memory.get(sessionId);
    if (!session || !session.currentQuestion) {
      throw new Error("Interview session was not found. Start the interview with a candidate first.");
    }
    if (session.done) {
      const feedback = this.feedbackGenerator.generate(session);
      return this.doneResponse(session, feedback);
    }

    const evaluation = this.evaluator.evaluate(session.currentQuestion, message, session.analysis);
    session.turns.push({ question: session.currentQuestion, answer: message, evaluation });

    if (session.turns.length >= session.plan.totalQuestions) {
      session.done = true;
      this.memory.set(session);
      return this.doneResponse(session, this.feedbackGenerator.generate(session));
    }

    session.currentIndex += 1;
    const nextPlanItem = { ...session.plan.items[session.currentIndex] };
    nextPlanItem.difficulty = this.difficultyAdapter.nextDifficulty(nextPlanItem.difficulty, evaluation);
    const nextQuestion = this.questionGenerator.generate(nextPlanItem, session.askedQuestionKeys, evaluation);
    session.currentQuestion = nextQuestion;
    this.memory.set(session);

    const transition =
      evaluation.verdict === "strong"
        ? "Good, that gives me enough signal to raise the bar."
        : evaluation.verdict === "mixed"
          ? "Thanks, I want to sharpen that into a more practical angle."
          : "Let's slow that down and make the next one more concrete.";

    return {
      reply: `${transition} Question ${nextQuestion.index} of ${session.plan.totalQuestions}: ${nextQuestion.text}`,
      done: false,
      sessionId,
      question: nextQuestion,
      progress: this.progress(session),
      metrics: { latestScore: evaluation.score, confidence: evaluation.confidence, difficulty: nextQuestion.difficulty }
    };
  }

  private doneResponse(session: InterviewSession, feedback: Feedback): InterviewResponse {
    return {
      reply: "Interview completed.",
      done: true,
      sessionId: session.sessionId,
      progress: this.progress(session),
      metrics: {
        latestScore: session.turns.at(-1)?.evaluation.score ?? 0,
        confidence: session.turns.at(-1)?.evaluation.confidence ?? session.analysis.confidence,
        difficulty: session.currentQuestion?.difficulty ?? "medium"
      },
      feedback
    };
  }

  private progress(session: InterviewSession) {
    const answered = session.turns.length;
    return {
      answered,
      total: session.plan.totalQuestions,
      percent: Math.round((answered / session.plan.totalQuestions) * 100),
      coveredDays: Array.from(new Set(session.turns.map((turn) => turn.question.day).concat(session.currentQuestion?.day ?? []))).filter(Boolean)
    };
  }
}
