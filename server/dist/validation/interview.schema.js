import { z } from "zod";
const missionSchema = z.object({
    day: z.number().int().positive(),
    title: z.string().min(1),
    passed: z.boolean().optional(),
    skipped: z.boolean().optional(),
    attempts: z.number().int().positive().optional()
});
export const candidateSchema = z.object({
    member: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        jobRole: z.string().min(1),
        yearsExperience: z.number().nonnegative(),
        education: z.string().min(1),
        status: z.string().min(1)
    }),
    missions: z.array(missionSchema),
    signals: z.object({
        commitDays: z.number().int().nonnegative(),
        missionsCompleted: z.number().int().nonnegative(),
        missionsFirstTry: z.number().int().nonnegative()
    })
});
export const interviewRequestSchema = z
    .object({
    sessionId: z.string().trim().min(1).optional(),
    candidateId: z.string().trim().min(1).optional(),
    candidate: candidateSchema.optional(),
    message: z.string().trim().min(1).max(6000).optional(),
    action: z.enum(["catalog", "reset"]).optional()
})
    .superRefine((value, context) => {
    if (value.action === "catalog")
        return;
    if (!value.sessionId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sessionId"],
            message: "sessionId is required unless action is catalog."
        });
    }
});
