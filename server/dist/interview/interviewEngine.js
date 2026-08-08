import { AppError } from "../errors/AppError.js";
import { CandidateAnalyzer } from "../services/candidateAnalyzer.js";
import { InterviewPlanner } from "../planner/interviewPlanner.js";
import { QuestionGenerator } from "./questionGenerator.js";
import { AnswerEvaluator } from "../evaluation/answerEvaluator.js";
import { DifficultyAdapter } from "./difficultyAdapter.js";
import { FeedbackGenerator } from "../feedback/feedbackGenerator.js";
import { logger } from "../logger/logger.js";
import { normalizeKey } from "../utils/text.js";
export class InterviewEngine {
    curriculumRepository;
    sessions;
    ai;
    planner;
    questionGenerator;
    evaluator;
    difficultyAdapter;
    feedbackGenerator;
    analyzer;
    constructor(curriculumRepository, sessions, ai, planner = new InterviewPlanner(), questionGenerator = new QuestionGenerator(), evaluator = new AnswerEvaluator(), difficultyAdapter = new DifficultyAdapter(), feedbackGenerator = new FeedbackGenerator()) {
        this.curriculumRepository = curriculumRepository;
        this.sessions = sessions;
        this.ai = ai;
        this.planner = planner;
        this.questionGenerator = questionGenerator;
        this.evaluator = evaluator;
        this.difficultyAdapter = difficultyAdapter;
        this.feedbackGenerator = feedbackGenerator;
        this.analyzer = new CandidateAnalyzer(this.curriculumRepository.getAll());
    }
    async start(sessionId, candidate) {
        const analysis = this.analyzer.analyze(candidate);
        const plan = this.planner.createPlan(this.analyzer.profile(candidate), this.curriculumRepository.getAll());
        const session = {
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
        const firstQuestion = await this.generateQuestion(session, plan.items[0]);
        session.currentQuestion = firstQuestion;
        this.sessions.set(session);
        return {
            reply: "Welcome, " +
                candidate.member.name +
                ". I will tailor this mocked interview to your cohort journey. Question 1 of " +
                plan.totalQuestions +
                ": " +
                firstQuestion.text,
            done: false,
            sessionId,
            question: firstQuestion,
            progress: this.progress(session),
            metrics: { latestScore: 0, confidence: analysis.confidence, difficulty: firstQuestion.difficulty }
        };
    }
    async answer(sessionId, message) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.currentQuestion) {
            throw new AppError("Interview session was not found. Start the interview with a candidate first.", 404, "SESSION_NOT_FOUND");
        }
        if (session.done) {
            return this.doneResponse(session);
        }
        const evaluation = await this.evaluateAnswer(session, message);
        session.turns.push({ question: session.currentQuestion, answer: message, evaluation });
        if (session.turns.length >= session.plan.totalQuestions) {
            session.done = true;
            this.sessions.set(session);
            return this.doneResponse(session);
        }
        session.currentIndex += 1;
        const nextPlanItem = { ...session.plan.items[session.currentIndex] };
        nextPlanItem.difficulty = this.difficultyAdapter.nextDifficulty(nextPlanItem.difficulty, evaluation);
        const nextQuestion = await this.generateQuestion(session, nextPlanItem, evaluation);
        session.currentQuestion = nextQuestion;
        this.sessions.set(session);
        const transition = evaluation.verdict === "strong"
            ? "Good, that gives me enough signal to raise the bar."
            : evaluation.verdict === "mixed"
                ? "Thanks, I want to sharpen that into a more practical angle."
                : "Let's slow that down and make the next one more concrete.";
        return {
            reply: transition + " Question " + nextQuestion.index + " of " + session.plan.totalQuestions + ": " + nextQuestion.text,
            done: false,
            sessionId,
            question: nextQuestion,
            progress: this.progress(session),
            metrics: { latestScore: evaluation.score, confidence: evaluation.confidence, difficulty: nextQuestion.difficulty }
        };
    }
    reset(sessionId) {
        this.sessions.delete(sessionId);
    }
    async doneResponse(session) {
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
            feedback: await this.generateFeedback(session)
        };
    }
    async generateQuestion(session, planItem, previousEvaluation) {
        if (this.ai) {
            try {
                const output = await this.ai.question.generate({
                    candidate: session.analysis,
                    day: planItem.day,
                    objective: planItem.objective,
                    stage: planItem.stage,
                    questionType: planItem.questionType,
                    difficulty: planItem.difficulty,
                    previousEvaluation,
                    previousAnswer: session.turns.at(-1)?.answer,
                    askedQuestions: session.turns.map((turn) => turn.question.text)
                });
                const question = this.questionGenerator.toInterviewQuestion(planItem, output.text);
                session.askedQuestionKeys.add(normalizeKey(question.text));
                return question;
            }
            catch (error) {
                logger.warn("AI question generation failed; falling back to deterministic generator.", {
                    sessionId: session.sessionId,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        return this.questionGenerator.generate(planItem, session.askedQuestionKeys, previousEvaluation);
    }
    async evaluateAnswer(session, answer) {
        if (this.ai) {
            try {
                return await this.ai.evaluation.evaluate({
                    candidate: session.analysis,
                    question: session.currentQuestion,
                    answer
                });
            }
            catch (error) {
                logger.warn("AI evaluation failed; falling back to deterministic evaluator.", {
                    sessionId: session.sessionId,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        return this.evaluator.evaluate(session.currentQuestion, answer, session.analysis);
    }
    async generateFeedback(session) {
        if (this.ai) {
            try {
                return await this.ai.feedback.generate({
                    candidate: session.analysis,
                    turns: session.turns
                });
            }
            catch (error) {
                logger.warn("AI feedback generation failed; falling back to deterministic generator.", {
                    sessionId: session.sessionId,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        return this.feedbackGenerator.generate(session);
    }
    progress(session) {
        const answered = session.turns.length;
        return {
            answered,
            total: session.plan.totalQuestions,
            percent: Math.round((answered / session.plan.totalQuestions) * 100),
            coveredDays: Array.from(new Set(session.turns.map((turn) => turn.question.day).concat(session.currentQuestion?.day ?? []))).filter(Boolean)
        };
    }
}
