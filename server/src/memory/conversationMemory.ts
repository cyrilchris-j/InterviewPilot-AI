import type {
  AnswerEvaluation,
  Difficulty,
  InterviewQuestion,
  InterviewStage,
  InterviewTurn,
  QuestionType
} from "../types/domain.js";
import { average, normalizeKey } from "../utils/text.js";

export type MemoryTopic = {
  day: number;
  dayTitle: string;
  objective: string;
  stage: InterviewStage;
  questionType: QuestionType;
  difficulty: Difficulty;
};

export type Mistake = {
  turn: number;
  question: string;
  answer: string;
  score: number;
  gaps: string[];
};

export type FollowUpContext = {
  topic: MemoryTopic;
  previousQuestion: string;
  previousAnswer: string;
  previousEvaluation: AnswerEvaluation;
  mistakes: readonly Mistake[];
  askedQuestions: readonly string[];
};

export type ConversationMemoryState = {
  sessionId: string;
  currentTopic?: MemoryTopic;
  askedQuestions: string[];
  askedQuestionKeys: string[];
  history: InterviewTurn[];
  mistakes: Mistake[];
  followedUpTopicKeys: string[];
};

const MISTAKE_SCORE_THRESHOLD = 2.8;

/**
 * Conversation memory for a single interview session.
 *
 * Owns the durable, session-scoped interview state:
 * - current topic
 * - asked questions (texts plus normalized keys for duplicate prevention)
 * - candidate answers and scores (via the history of turns)
 * - mistakes (weak answers / detected gaps)
 * - full conversation history
 *
 * The state lives on the {@link InterviewSession} so it survives the entire
 * interview across turns. `toState` / `fromState` keep it serializable for
 * future persistent storage.
 */
export class ConversationMemory {
  private constructor(private readonly state: ConversationMemoryState) {}

  static create(sessionId: string): ConversationMemory {
    return new ConversationMemory({
      sessionId,
      currentTopic: undefined,
      askedQuestions: [],
      askedQuestionKeys: [],
      history: [],
      mistakes: [],
      followedUpTopicKeys: []
    });
  }

  static fromState(state: ConversationMemoryState): ConversationMemory {
    return new ConversationMemory(state);
  }

  get sessionId(): string {
    return this.state.sessionId;
  }

  get currentTopic(): MemoryTopic | undefined {
    return this.state.currentTopic;
  }

  get askedQuestions(): readonly string[] {
    return this.state.askedQuestions;
  }

  get askedQuestionKeys(): readonly string[] {
    return this.state.askedQuestionKeys;
  }

  get history(): readonly InterviewTurn[] {
    return this.state.history;
  }

  get mistakes(): readonly Mistake[] {
    return this.state.mistakes;
  }

  get scores(): readonly number[] {
    return this.state.history.map((turn) => turn.evaluation.score);
  }

  get averageScore(): number {
    return Number(average(this.scores).toFixed(1));
  }

  get answeredCount(): number {
    return this.state.history.length;
  }

  get latestTurn(): InterviewTurn | undefined {
    return this.state.history.at(-1);
  }

  get latestEvaluation(): AnswerEvaluation | undefined {
    return this.state.history.at(-1)?.evaluation;
  }

  setCurrentTopic(topic: MemoryTopic): void {
    this.state.currentTopic = topic;
  }

  hasAsked(questionText: string): boolean {
    return this.state.askedQuestionKeys.includes(normalizeKey(questionText));
  }

  recordQuestion(question: InterviewQuestion): void {
    this.state.askedQuestions.push(question.text);
    this.state.askedQuestionKeys.push(normalizeKey(question.text));
  }

  recordTurn(question: InterviewQuestion, answer: string, evaluation: AnswerEvaluation): void {
    this.state.history.push({ question, answer, evaluation });
    if (evaluation.score < MISTAKE_SCORE_THRESHOLD || evaluation.detectedGaps.length > 0) {
      this.state.mistakes.push({
        turn: this.state.history.length,
        question: question.text,
        answer,
        score: evaluation.score,
        gaps: evaluation.detectedGaps
      });
    }
  }

  isFollowedUp(topicKey: string): boolean {
    return this.state.followedUpTopicKeys.includes(topicKey);
  }

  markFollowedUp(topicKey: string): void {
    if (!this.isFollowedUp(topicKey)) {
      this.state.followedUpTopicKeys.push(topicKey);
    }
  }

  getFollowUpContext(): FollowUpContext | undefined {
    const topic = this.state.currentTopic;
    const latest = this.state.history.at(-1);
    if (!topic || !latest) return undefined;
    return {
      topic,
      previousQuestion: latest.question.text,
      previousAnswer: latest.answer,
      previousEvaluation: latest.evaluation,
      mistakes: this.state.mistakes,
      askedQuestions: this.state.askedQuestions
    };
  }

  toState(): ConversationMemoryState {
    return this.state;
  }
}
