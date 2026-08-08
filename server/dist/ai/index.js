import { PromptStore } from "./promptStore.js";
import { OpenAIResponsesClient } from "./responsesClient.js";
import { QuestionService } from "./services/questionService.js";
import { EvaluationService } from "./services/evaluationService.js";
import { FeedbackService } from "./services/feedbackService.js";
export { PromptStore } from "./promptStore.js";
export { OpenAIResponsesClient } from "./responsesClient.js";
export { AiError } from "./aiError.js";
export { QuestionService } from "./services/questionService.js";
export { EvaluationService } from "./services/evaluationService.js";
export { FeedbackService } from "./services/feedbackService.js";
/**
 * Builds the modular AI services backed by the OpenAI Responses API.
 * Returns null when no API key is configured, which lets the interview
 * engine run its deterministic offline fallback.
 */
export function createAiServices(options) {
    if (!options.apiKey)
        return null;
    const prompts = new PromptStore(options.promptsDir);
    const client = new OpenAIResponsesClient(options.apiKey, options.model);
    return {
        question: new QuestionService(prompts, client),
        evaluation: new EvaluationService(prompts, client),
        feedback: new FeedbackService(prompts, client)
    };
}
