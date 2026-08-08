import { questionOutputSchema } from "../schemas.js";
import { describeCandidate, loadSystemPrompt, renderTaskPrompt } from "./base.js";
const PROMPT_NAME = "question";
export class QuestionService {
    prompts;
    client;
    constructor(prompts, client) {
        this.prompts = prompts;
        this.client = client;
    }
    async generate(input) {
        return this.client.create({
            name: "interview_question",
            instructions: loadSystemPrompt(this.prompts),
            input: renderTaskPrompt(this.prompts, PROMPT_NAME, this.variables(input)),
            schema: questionOutputSchema
        });
    }
    /**
     * Streaming variant for the question generator. Ready for a future
     * server-sent event endpoint; the interview flow currently uses
     * {@link generate}.
     */
    async *stream(input) {
        yield* this.client.stream({
            instructions: loadSystemPrompt(this.prompts),
            input: renderTaskPrompt(this.prompts, PROMPT_NAME, this.variables(input))
        });
    }
    variables(input) {
        return {
            candidateProfile: describeCandidate(input.candidate),
            dayNumber: String(input.day.day),
            dayTitle: input.day.title,
            dayType: input.day.type,
            objectives: input.day.objectives.length ? input.day.objectives.join("; ") : "(none)",
            tools: input.day.tools.length ? input.day.tools.join(", ") : "(none)",
            stage: input.stage,
            questionType: input.questionType,
            difficulty: input.difficulty,
            objective: input.objective,
            previousEvaluation: input.previousEvaluation
                ? JSON.stringify(input.previousEvaluation)
                : "(none)",
            previousAnswer: input.previousAnswer?.trim() ? input.previousAnswer.trim() : "(none)",
            askedQuestions: input.askedQuestions.length
                ? input.askedQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n")
                : "(none)"
        };
    }
}
