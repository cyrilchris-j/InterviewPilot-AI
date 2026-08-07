import { CandidateProfileBuilder } from "../candidate/candidateProfile.js";
import { CandidateScoring, recommendTopics } from "../candidate/candidateScoring.js";
const LOW_CONSISTENCY_DAYS = 20;
const STRENGTH_LIMIT = 5;
export class CandidateAnalyzer {
    profileBuilder;
    scoring;
    constructor(curriculum) {
        this.profileBuilder = new CandidateProfileBuilder(curriculum);
        this.scoring = new CandidateScoring();
    }
    analyze(candidate) {
        const profile = this.profileBuilder.build(candidate);
        const score = this.scoring.score(profile);
        const strongDays = profile.strengths.map((strength) => strength.day);
        const weakDays = profile.weakAreas.map((area) => area.day);
        return {
            id: candidate.member.id,
            name: candidate.member.name,
            role: candidate.member.jobRole,
            seniority: profile.experience.seniority,
            completedDays: profile.completedDays,
            skippedDays: profile.skippedDays,
            strongDays,
            weakDays,
            averageAttempts: Number(profile.attempts.average.toFixed(1)),
            confidence: score.confidence,
            strengths: this.describeStrengths(profile),
            weaknesses: this.describeWeaknesses(profile),
            recommendedTopics: recommendTopics(profile),
            difficulty: score.difficulty,
            riskNotes: this.riskNotes(profile, weakDays)
        };
    }
    describeStrengths(profile) {
        const strengths = profile.strengths
            .slice(0, 3)
            .map((strength) => `${strength.title} mastered on the first attempt.`);
        if (profile.signals.missionsCompleted >= profile.totalDays * 0.8) {
            strengths.push(`Completed ${profile.signals.missionsCompleted} of ${profile.totalDays} curriculum days.`);
        }
        if (profile.signals.commitDays >= profile.totalDays * 0.8) {
            strengths.push(`Committed consistently on ${profile.signals.commitDays} of ${profile.totalDays} days.`);
        }
        if (profile.attempts.firstTryRate >= 0.8) {
            strengths.push("High first-try pass rate across missions.");
        }
        return strengths.slice(0, STRENGTH_LIMIT);
    }
    describeWeaknesses(profile) {
        if (profile.weakAreas.length === 0) {
            return ["No skipped or failed modules reported; validate depth under harder tradeoffs."];
        }
        return profile.weakAreas.slice(0, 4).map((area) => {
            if (area.reason === "failed")
                return `${area.title} was attempted but not completed.`;
            if (area.reason === "struggled")
                return `${area.title} needed ${area.attempts} attempts.`;
            return `${area.title} was skipped.`;
        });
    }
    riskNotes(profile, weakDays) {
        const notes = [];
        if (profile.failedDays.length > 0) {
            notes.push(`Failed day(s) ${profile.failedDays.join(", ")} need foundational review before production topics.`);
        }
        if (profile.skippedDays.includes(23)) {
            notes.push("Skipped Day 23, avoid advanced MCP architecture until prerequisites are confirmed.");
        }
        if (weakDays.includes(10)) {
            notes.push("Day 10 retrieval needed multiple attempts, use practical retrieval follow-ups.");
        }
        if (profile.signals.commitDays < LOW_CONSISTENCY_DAYS) {
            notes.push("Lower commit-day consistency, probe production habits and debugging discipline.");
        }
        return notes;
    }
}
