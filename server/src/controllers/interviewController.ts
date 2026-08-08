import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import { CandidateRepository } from "../candidate/candidateRepository.js";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { InterviewEngine } from "../interview/interviewEngine.js";
import { SessionManager } from "../sessions/sessionManager.js";
import { env } from "../config/env.js";
import { createAiServices } from "../ai/index.js";
import { logger } from "../logger/logger.js";
import type { InterviewRequestBody } from "../validation/interview.schema.js";

const candidateRepository = new CandidateRepository();
const curriculumRepository = new CurriculumRepository();
const sessionManager = new SessionManager(env.SESSION_TTL_MINUTES * 60_000);
const aiServices = createAiServices({
  apiKey: env.OPENAI_API_KEY,
  model: env.OPENAI_MODEL,
  promptsDir: env.PROMPTS_DIR
});
const engine = new InterviewEngine(curriculumRepository, sessionManager, aiServices ?? undefined);

if (aiServices) {
  logger.info("OpenAI Responses API enabled; interview engine uses AI services with structured outputs.", {
    model: env.OPENAI_MODEL
  });
} else {
  logger.info("OPENAI_API_KEY not set; interview engine runs in deterministic offline mode.");
}

function buildCatalogResponse() {
  return {
    reply: "Candidate catalog loaded.",
    done: false,
    candidates: candidateRepository.summaries(),
    curriculumDays: curriculumRepository.getDays().map((day) => ({ day: day.day, title: day.title, type: day.type }))
  };
}

export const getInterviewCatalog: RequestHandler = (_request, response) => {
  response.json(buildCatalogResponse());
};

export const postInterview: RequestHandler<unknown, unknown, InterviewRequestBody> = async (request, response, next) => {
  const body = request.body;

  if (body.action === "catalog") {
    response.json(buildCatalogResponse());
    return;
  }

  const sessionId = body.sessionId;
  if (!sessionId) {
    throw new AppError("sessionId is required.", 400, "SESSION_ID_REQUIRED");
  }

  if (body.action === "reset") {
    engine.reset(sessionId);
    response.json({ reply: "Interview session reset.", done: false, sessionId });
    return;
  }

  if (body.message) {
    try {
      response.json(await engine.answer(sessionId, body.message));
    } catch (error) {
      next(error);
    }
    return;
  }

  const candidate =
    body.candidate ??
    (body.candidateId ? candidateRepository.findById(body.candidateId) : undefined) ??
    candidateRepository.list()[0];

  if (!candidate) {
    throw new AppError("A valid candidate object or candidateId is required.", 400, "CANDIDATE_REQUIRED");
  }

  try {
    response.json(await engine.start(sessionId, candidate));
  } catch (error) {
    next(error);
  }
};
