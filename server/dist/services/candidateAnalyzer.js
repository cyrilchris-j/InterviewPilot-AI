import { average, clamp } from "../utils/text.js";
export class CandidateAnalyzer {
    analyze(candidate) {
        const completedDays = candidate.missions.filter((mission) => mission.passed).map((mission) => mission.day);
        const skippedDays = candidate.missions.filter((mission) => mission.skipped).map((mission) => mission.day);
        const strongDays = candidate.missions
            .filter((mission) => mission.passed && (mission.attempts ?? 99) <= 1)
            .map((mission) => mission.day);
        const weakDays = candidate.missions
            .filter((mission) => mission.skipped || (mission.attempts ?? 0) >= 4)
            .map((mission) => mission.day);
        const attempts = candidate.missions
            .filter((mission) => mission.passed && typeof mission.attempts === "number")
            .map((mission) => mission.attempts ?? 1);
        const firstTryRatio = candidate.signals.missionsCompleted
            ? candidate.signals.missionsFirstTry / candidate.signals.missionsCompleted
            : 0.4;
        const confidence = clamp(Math.round((firstTryRatio * 60 + candidate.signals.commitDays) / 9), 1, 10);
        const seniority = candidate.member.yearsExperience >= 8 ? "senior" : candidate.member.yearsExperience >= 4 ? "mid" : "emerging";
        const riskNotes = [];
        if (skippedDays.includes(23)) {
            riskNotes.push("Skipped Day 23, avoid advanced MCP architecture until prerequisites are confirmed.");
        }
        if (weakDays.includes(10)) {
            riskNotes.push("Day 10 retrieval needed multiple attempts, use practical retrieval follow-ups.");
        }
        if (candidate.signals.commitDays < 20) {
            riskNotes.push("Lower commit-day consistency, probe production habits and debugging discipline.");
        }
        return {
            id: candidate.member.id,
            name: candidate.member.name,
            role: candidate.member.jobRole,
            seniority,
            completedDays,
            skippedDays,
            strongDays,
            weakDays,
            confidence,
            averageAttempts: Number(average(attempts).toFixed(1)),
            riskNotes
        };
    }
}
