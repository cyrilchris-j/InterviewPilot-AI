import { AppError } from "../errors/AppError.js";
import { CandidateAnalyzer } from "../services/candidateAnalyzer.js";
import { InterviewPlanner } from "../planner/interviewPlanner.js";
import { QuestionGenerator } from "./questionGenerator.js";
import { AnswerEvaluator } from "../evaluation/answerEvaluator.js";
import { DifficultyAdapter } from "./difficultyAdapter.js";
import { FeedbackGenerator } from "../feedback/feedbackGenerator.js";
import { logger } from "../logger/logger.js";
import { ConversationMemory } from "../memory/conversationMemory.js";
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
    async start(sessionId, candidate, profile) {
        const analysis = this.analyzer.analyze(candidate);
        const plan = this.planner.createPlan(this.analyzer.profile(candidate), this.curriculumRepository.getAll());
        const session = {
            sessionId,
            candidate,
            analysis,
            plan,
            currentIndex: 0,
            memory: ConversationMemory.create(sessionId),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            done: false
        };
        const firstPlanItem = plan.items[0];
        const firstQuestion = await this.generateQuestion(session, firstPlanItem);
        session.currentQuestion = firstQuestion;
        session.memory.setCurrentTopic(this.topicSnapshot(firstPlanItem));
        session.memory.recordQuestion(firstQuestion);
        this.sessions.set(session);
        const weakSummary = analysis.weakDays.length > 0
            ? `I'll pay close attention to ${analysis.weakDays.slice(0, 2).map(d => `Day ${d}`).join(' and ')}, which showed some gaps in your journey.`
            : "Your curriculum history looks solid across the board.";
        const strengthNote = analysis.strongDays.length > 0
            ? ` You showed real mastery on ${analysis.strongDays.slice(0, 2).map(d => `Day ${d}`).join(' and ')}, so I'll push depth there.`
            : "";
        let intro = `Welcome, ${candidate.member.name}. I've reviewed your cohort history — ${analysis.completedDays.length} days completed, `;
        if (profile) {
            intro = `Welcome. I see you're an ${profile.targetRole} targeting a role at ${profile.company}. I've reviewed your cohort history — ${analysis.completedDays.length} days completed, `;
        }
        return {
            reply: `${intro}` +
                `${analysis.skippedDays.length} skipped, and an average of ${analysis.averageAttempts} attempts per mission. ` +
                `${weakSummary}${strengthNote} ` +
                `We'll cover ${plan.uniqueDays.length} curriculum topics across ${plan.totalQuestions} questions. Ready? ` +
                `Question 1 of ${plan.totalQuestions}: ${firstQuestion.text}`,
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
        const planItem = session.plan.items[session.currentIndex];
        const evaluation = await this.evaluateAnswer(session, message);
        session.memory.recordTurn(session.currentQuestion, message, evaluation);
        if (evaluation.verdict === "weak" && !session.memory.isFollowedUp(String(planItem.index))) {
            return this.followUpResponse(session, planItem, evaluation);
        }
        if (session.currentIndex >= session.plan.totalQuestions - 1) {
            session.done = true;
            this.sessions.set(session);
            return this.doneResponse(session);
        }
        session.currentIndex += 1;
        const nextPlanItem = { ...session.plan.items[session.currentIndex] };
        nextPlanItem.difficulty = this.difficultyAdapter.nextDifficulty(nextPlanItem.difficulty, evaluation);
        const nextQuestion = await this.generateQuestion(session, nextPlanItem, evaluation);
        session.currentQuestion = nextQuestion;
        session.memory.setCurrentTopic(this.topicSnapshot(nextPlanItem));
        session.memory.recordQuestion(nextQuestion);
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
    async followUpResponse(session, planItem, evaluation) {
        session.memory.markFollowedUp(String(planItem.index));
        const followUp = await this.generateFollowUp(session, planItem, evaluation);
        session.currentQuestion = followUp;
        session.memory.recordQuestion(followUp);
        this.sessions.set(session);
        return {
            reply: "Let's go deeper here. " + followUp.text,
            done: false,
            sessionId: session.sessionId,
            question: followUp,
            progress: this.progress(session),
            metrics: { latestScore: evaluation.score, confidence: evaluation.confidence, difficulty: followUp.difficulty }
        };
    }
    async doneResponse(session) {
        return {
            reply: "Interview completed.",
            done: true,
            sessionId: session.sessionId,
            progress: this.progress(session),
            metrics: {
                latestScore: session.memory.latestTurn?.evaluation.score ?? 0,
                confidence: session.memory.latestTurn?.evaluation.confidence ?? session.analysis.confidence,
                difficulty: session.currentQuestion?.difficulty ?? "medium"
            },
            feedback: await this.generateFeedback(session)
        };
    }
    async generateQuestion(session, planItem, previousEvaluation) {
        const aiText = await this.aiQuestionText(session, planItem, previousEvaluation);
        if (aiText) {
            return this.questionGenerator.toInterviewQuestion(planItem, aiText);
        }
        return this.questionGenerator.generate(planItem, {
            candidate: session.analysis,
            askedKeys: new Set(session.memory.askedQuestionKeys),
            previousEvaluation,
            previousAnswer: session.memory.latestTurn?.answer
        });
    }
    async generateFollowUp(session, planItem, evaluation) {
        const aiText = await this.aiQuestionText(session, planItem, evaluation);
        if (aiText) {
            return this.questionGenerator.toInterviewQuestion(planItem, aiText, "follow-up");
        }
        return this.questionGenerator.followUp(planItem, {
            candidate: session.analysis,
            askedKeys: new Set(session.memory.askedQuestionKeys),
            previousEvaluation: evaluation,
            previousAnswer: session.memory.latestTurn?.answer
        });
    }
    async aiQuestionText(session, planItem, previousEvaluation) {
        if (!this.ai)
            return undefined;
        try {
            const output = await this.ai.question.generate({
                candidate: session.analysis,
                day: planItem.day,
                objective: planItem.objective,
                stage: planItem.stage,
                questionType: planItem.questionType,
                difficulty: planItem.difficulty,
                previousEvaluation,
                previousAnswer: session.memory.latestTurn?.answer,
                askedQuestions: session.memory.askedQuestions
            });
            if (session.memory.hasAsked(output.text)) {
                logger.warn("AI generated a duplicate question; falling back to deterministic generator.", {
                    sessionId: session.sessionId
                });
                return undefined;
            }
            return output.text;
        }
        catch (error) {
            logger.warn("AI question generation failed; falling back to deterministic generator.", {
                sessionId: session.sessionId,
                error: error instanceof Error ? error.message : String(error)
            });
            return undefined;
        }
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
                    turns: session.memory.history
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
    topicSnapshot(planItem) {
        return {
            day: planItem.day.day,
            dayTitle: planItem.day.title,
            objective: planItem.objective,
            stage: planItem.stage,
            questionType: planItem.questionType,
            difficulty: planItem.difficulty
        };
    }
    progress(session) {
        const answered = Math.min(session.currentIndex + (session.done ? 1 : 0), session.plan.totalQuestions);
        const total = session.plan.totalQuestions;
        return {
            answered,
            total,
            percent: Math.round((answered / total) * 100),
            coveredDays: Array.from(new Set(session.memory.history.map((turn) => turn.question.day).concat(session.currentQuestion?.day ?? []))).filter((day) => day !== undefined)
        };
    }
}
