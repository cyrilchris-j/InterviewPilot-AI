import type { CandidateAnalysis } from "../../types/domain.js";
import { PromptStore, type PromptVariables } from "../promptStore.js";

const SYSTEM_PROMPT_NAME = "system";

export function loadSystemPrompt(prompts: PromptStore): string {
  return prompts.load(SYSTEM_PROMPT_NAME);
}

export function renderTaskPrompt(prompts: PromptStore, name: string, variables: PromptVariables): string {
  return prompts.render(name, variables);
}

export function describeCandidate(analysis: CandidateAnalysis): string {
  return JSON.stringify(
    {
      id: analysis.id,
      name: analysis.name,
      role: analysis.role,
      seniority: analysis.seniority,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendedTopics: analysis.recommendedTopics,
      difficulty: analysis.difficulty,
      riskNotes: analysis.riskNotes
    },
    null,
    2
  );
}
