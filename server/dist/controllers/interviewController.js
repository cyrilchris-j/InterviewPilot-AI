import { z } from "zod";
import { CandidateRepository } from "../candidate/candidateRepository.js";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { SessionMemory } from "../memory/sessionMemory.js";
import { InterviewEngine } from "../interview/interviewEngine.js";
const requestSchema = z.object({
    sessionId: z.string().min(1).optional(),
    candidateId: z.string().optional(),
    candidate: z.unknown().optional(),
    message: z.string().optional(),
    action: z.enum(["catalog", "reset"]).optional()
});
const candidateRepository = new CandidateRepository();
const curriculumRepository = new CurriculumRepository();
const memory = new SessionMemory();
const engine = new InterviewEngine(curriculumRepository, memory);
export const interviewController = (request, response, next) => {
    try {
        const body = requestSchema.parse(request.body);
        if (body.action === "catalog") {
            response.json({
                reply: "Candidate catalog loaded.",
                done: false,
                candidates: candidateRepository.summaries(),
                curriculumDays: curriculumRepository.getDays().map((day) => ({ day: day.day, title: day.title, type: day.type }))
            });
            return;
        }
        if (!body.sessionId) {
            throw new Error("sessionId is required.");
        }
        if (body.action === "reset") {
            memory.delete(body.sessionId);
            response.json({ reply: "Interview session reset.", done: false, sessionId: body.sessionId });
            return;
        }
        if (body.message) {
            response.json(engine.answer(body.sessionId, body.message));
            return;
        }
        const candidate = body.candidate ??
            (body.candidateId ? candidateRepository.findById(body.candidateId) : undefined) ??
            candidateRepository.list()[0];
        if (!candidate) {
            throw new Error("A valid candidate object or candidateId is required.");
        }
        response.json(engine.start(body.sessionId, candidate));
    }
    catch (error) {
        next(error);
    }
};
