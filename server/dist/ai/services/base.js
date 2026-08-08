const SYSTEM_PROMPT_NAME = "system";
export function loadSystemPrompt(prompts) {
    return prompts.load(SYSTEM_PROMPT_NAME);
}
export function renderTaskPrompt(prompts, name, variables) {
    return prompts.render(name, variables);
}
export function describeCandidate(analysis) {
    return JSON.stringify({
        id: analysis.id,
        name: analysis.name,
        role: analysis.role,
        seniority: analysis.seniority,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendedTopics: analysis.recommendedTopics,
        difficulty: analysis.difficulty,
        riskNotes: analysis.riskNotes
    }, null, 2);
}
