import { average, normalizeKey } from "../utils/text.js";
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
    state;
    constructor(state) {
        this.state = state;
    }
    static create(sessionId) {
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
    static fromState(state) {
        return new ConversationMemory(state);
    }
    get sessionId() {
        return this.state.sessionId;
    }
    get currentTopic() {
        return this.state.currentTopic;
    }
    get askedQuestions() {
        return this.state.askedQuestions;
    }
    get askedQuestionKeys() {
        return this.state.askedQuestionKeys;
    }
    get history() {
        return this.state.history;
    }
    get mistakes() {
        return this.state.mistakes;
    }
    get scores() {
        return this.state.history.map((turn) => turn.evaluation.score);
    }
    get averageScore() {
        return Number(average(this.scores).toFixed(1));
    }
    get answeredCount() {
        return this.state.history.length;
    }
    get latestTurn() {
        return this.state.history.at(-1);
    }
    get latestEvaluation() {
        return this.state.history.at(-1)?.evaluation;
    }
    setCurrentTopic(topic) {
        this.state.currentTopic = topic;
    }
    hasAsked(questionText) {
        return this.state.askedQuestionKeys.includes(normalizeKey(questionText));
    }
    recordQuestion(question) {
        this.state.askedQuestions.push(question.text);
        this.state.askedQuestionKeys.push(normalizeKey(question.text));
    }
    recordTurn(question, answer, evaluation) {
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
    isFollowedUp(topicKey) {
        return this.state.followedUpTopicKeys.includes(topicKey);
    }
    markFollowedUp(topicKey) {
        if (!this.isFollowedUp(topicKey)) {
            this.state.followedUpTopicKeys.push(topicKey);
        }
    }
    getFollowUpContext() {
        const topic = this.state.currentTopic;
        const latest = this.state.history.at(-1);
        if (!topic || !latest)
            return undefined;
        return {
            topic,
            previousQuestion: latest.question.text,
            previousAnswer: latest.answer,
            previousEvaluation: latest.evaluation,
            mistakes: this.state.mistakes,
            askedQuestions: this.state.askedQuestions
        };
    }
    toState() {
        return this.state;
    }
}
