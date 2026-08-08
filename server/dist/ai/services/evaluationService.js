import { average } from "../../utils/text.js";
import { evaluationOutputSchema } from "../schemas.js";
import { describeCandidate, loadSystemPrompt, renderTaskPrompt } from "./base.js";
const PROMPT_NAME = "evaluation";
export class EvaluationService {
    prompts;
    client;
    constructor(prompts, client) {
        this.prompts = prompts;
        this.client = client;
    }
    async evaluate(input) {
        const output = await this.client.create({
            name: "answer_evaluation",
            instructions: loadSystemPrompt(this.prompts),
            input: renderTaskPrompt(this.prompts, PROMPT_NAME, this.variables(input)),
            schema: evaluationOutputSchema
        });
        return {
            ...output,
            score: Number(average([
                output.correctness,
                output.depth,
                output.confidence,
                output.practicalUnderstanding,
                output.communication,
                output.reasoning,
                output.productionThinking,
                output.architectureThinking
            ]).toFixed(1))
        };
    }
    variables(input) {
        return {
            candidateProfile: describeCandidate(input.candidate),
            question: input.question.text,
            answer: input.answer
        };
    }
}
