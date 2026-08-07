import { dataPath } from "../utils/dataPaths.js";
import { readJson } from "../utils/readJson.js";
export class CandidateRepository {
    candidates;
    constructor() {
        this.candidates = readJson(dataPath("candidates.json")).candidates;
    }
    list() {
        return this.candidates;
    }
    findById(id) {
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
}
