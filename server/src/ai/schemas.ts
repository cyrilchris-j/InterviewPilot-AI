import { z } from "zod";

const scoreSchema = z.number().int().min(1).max(5);

export const questionOutputSchema = z.object({
  text: z.string().min(1)
});
export type QuestionOutput = z.infer<typeof questionOutputSchema>;

export const evaluationOutputSchema = z.object({
  correctness: scoreSchema,
  depth: scoreSchema,
  confidence: scoreSchema,
  practicalUnderstanding: scoreSchema,
  communication: scoreSchema,
  reasoning: scoreSchema,
  productionThinking: scoreSchema,
  architectureThinking: scoreSchema,
  verdict: z.enum(["strong", "mixed", "weak"]),
  evidence: z.string().min(1),
  followUpHint: z.string().min(1),
  nextAction: z.string().min(1),
  detectedStrengths: z.array(z.string().min(1)),
  detectedGaps: z.array(z.string().min(1))
});
export type EvaluationOutput = z.infer<typeof evaluationOutputSchema>;

export const feedbackOutputSchema = z.object({
  summary: z.string().min(1),
  strengths: z.array(z.string().min(1)),
  gaps: z.array(z.string().min(1)),
  next: z.array(z.string().min(1)),
  overallRating: z.string().min(1)
});
export type FeedbackOutput = z.infer<typeof feedbackOutputSchema>;
