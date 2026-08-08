import { dataPath } from "../utils/dataPaths.js";
import { readJson } from "../utils/readJson.js";
import type { Candidate, CandidateCatalog } from "../types/domain.js";

export class CandidateRepository {
  private readonly candidates: Candidate[];

  constructor() {
    this.candidates = readJson<CandidateCatalog>(dataPath("candidates.json")).candidates;
  }

  list(): Candidate[] {
    return this.candidates;
  }

  findById(id: string): Candidate | undefined {
    return this.candidates.find((candidate) => candidate.member.id === id);
  }

  summaries() {
    return this.candidates.map((candidate) => ({
      id: candidate.member.id,
      name: candidate.member.name,
      role: candidate.member.jobRole,
      yearsExperience: candidate.member.yearsExperience,
      completed: candidate.signals.missionsCompleted,
      firstTry: candidate.signals.missionsFirstTry
    }));
  }

  details() {
    return this.candidates.map((candidate) => ({
      id: candidate.member.id,
      name: candidate.member.name,
      role: candidate.member.jobRole,
      yearsExperience: candidate.member.yearsExperience,
      education: candidate.member.education,
      status: candidate.member.status,
      missions: candidate.missions,
      signals: candidate.signals
    }));
  }
}
