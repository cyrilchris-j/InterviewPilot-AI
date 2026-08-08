import type { Feedback, InterviewTurn } from "../../types/domain.js";
import { average, unique } from "../../utils/text.js";
import { summarizeTurns } from "../../feedback/turnSummary.js";
import { PromptStore, type PromptVariables } from "../promptStore.js";
import { OpenAIResponsesClient } from "../responsesClient.js";
import { feedbackOutputSchema } from "../schemas.js";
import type { FeedbackAIService, FeedbackServiceInput } from "../types.js";
import { describeCandidate, loadSystemPrompt, renderTaskPrompt } from "./base.js";

const PROMPT_NAME = "feedback";
const STRONG_TURN_LIMIT = 3;
const WEAK_TURN_LIMIT = 3;

export class FeedbackService implements FeedbackAIService {
  constructor(
    private readonly prompts: PromptStore,
    private readonly client: OpenAIResponsesClient
  ) {}

  async generate(input: FeedbackServiceInput): Promise<Feedback> {
    const output = await this.client.create({
      name: "interview_feedback",
      instructions: loadSystemPrompt(this.prompts),
      input: renderTaskPrompt(this.prompts, PROMPT_NAME, this.variables(input)),
      schema: feedbackOutputSchema
    });

    const { topicScores, recommendedDays, learningPath } = summarizeTurns(input.turns);

    return {
      summary: output.summary,
      strengths: output.strengths,
      gaps: output.gaps,
      next: output.next,
      topicScores,
      recommendedDays,
      learningPath,
      overallRating: output.overallRating
    };
  }

  private variables(input: FeedbackServiceInput): PromptVariables {
    const turns = input.turns;
    const scores = turns.map((turn) => turn.evaluation.score);
    const avg = Number(average(scores).toFixed(1));
    const strongest = [...turns].sort((a, b) => b.evaluation.score - a.evaluation.score).slice(0, STRONG_TURN_LIMIT);
    const weakest = [...turns].sort((a, b) => a.evaluation.score - b.evaluation.score).slice(0, WEAK_TURN_LIMIT);

    return {
      candidateProfile: describeCandidate(input.candidate),
      transcript: this.formatTranscript(turns),
      questionsAnswered: String(turns.length),
      daysCovered: String(unique(turns.map((turn) => turn.question.day)).length),
      averageScore: String(avg),
      strongestTurns: this.formatTurns(strongest),
      weakestTurns: this.formatTurns(weakest)
    };
  }

  private formatTranscript(turns: InterviewTurn[]): string {
    return turns
      .map(
        (turn, index) =>
          `Turn ${index + 1} (Day ${turn.question.day}: ${turn.question.dayTitle})\n` +
          `Q: ${turn.question.text}\n` +
          `A: ${turn.answer}\n` +
          `Score: ${turn.evaluation.score}/5 (${turn.evaluation.verdict})\n` +
          `Evidence: ${turn.evaluation.evidence}\n` +
          `Follow-up hint: ${turn.evaluation.followUpHint}`
      )
      .join("\n\n");
  }

  private formatTurns(turns: InterviewTurn[]): string {
    return turns
      .map(
        (turn) =>
          `- Day ${turn.question.day} (${turn.question.dayTitle}): ${turn.evaluation.score}/5 (${turn.evaluation.verdict})`
      )
      .join("\n");
  }
}
