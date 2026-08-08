import type { AnswerEvaluation } from "../../types/domain.js";
import { average } from "../../utils/text.js";
import { PromptStore, type PromptVariables } from "../promptStore.js";
import { OpenAIResponsesClient } from "../responsesClient.js";
import { evaluationOutputSchema } from "../schemas.js";
import type { EvaluationAIService, EvaluationServiceInput } from "../types.js";
import { describeCandidate, loadSystemPrompt, renderTaskPrompt } from "./base.js";

const PROMPT_NAME = "evaluation";

export class EvaluationService implements EvaluationAIService {
  constructor(
    private readonly prompts: PromptStore,
    private readonly client: OpenAIResponsesClient
  ) {}

  async evaluate(input: EvaluationServiceInput): Promise<AnswerEvaluation> {
    const output = await this.client.create({
      name: "answer_evaluation",
      instructions: loadSystemPrompt(this.prompts),
      input: renderTaskPrompt(this.prompts, PROMPT_NAME, this.variables(input)),
      schema: evaluationOutputSchema
    });

    return {
      ...output,
      score: Number(
        average([
          output.correctness,
          output.depth,
          output.confidence,
          output.practicalUnderstanding,
          output.communication,
          output.reasoning,
          output.productionThinking,
          output.architectureThinking
        ]).toFixed(1)
      )
    };
  }

  private variables(input: EvaluationServiceInput): PromptVariables {
    return {
      candidateProfile: describeCandidate(input.candidate),
      question: input.question.text,
      answer: input.answer
    };
  }
}
