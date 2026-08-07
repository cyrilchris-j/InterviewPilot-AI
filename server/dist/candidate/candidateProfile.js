import { average } from "../utils/text.js";
const FIRST_TRY_ATTEMPTS = 1;
const STRUGGLE_ATTEMPTS = 4;
export class CandidateProfileBuilder {
    curriculum;
    dayMap;
    constructor(curriculum) {
        this.curriculum = curriculum;
        this.dayMap = new Map(curriculum.days.map((day) => [day.day, day]));
    }
    build(candidate) {
        const totalDays = this.curriculum.days.length;
        const completedDays = candidate.missions.filter((mission) => mission.passed).map((mission) => mission.day);
        const skippedDays = candidate.missions.filter((mission) => mission.skipped).map((mission) => mission.day);
        const failedDays = candidate.missions.filter((mission) => !mission.passed && !mission.skipped).map((mission) => mission.day);
        const passedMissions = candidate.missions.filter((mission) => mission.passed);
        const passedAttempts = passedMissions
            .map((mission) => mission.attempts ?? FIRST_TRY_ATTEMPTS)
            .filter((attempts) => attempts > 0);
        const firstTryRate = candidate.signals.missionsCompleted
            ? candidate.signals.missionsFirstTry / candidate.signals.missionsCompleted
            : 0;
        return {
            totalDays,
            completedDays,
            skippedDays,
            failedDays,
            attempts: {
                passed: passedAttempts,
                average: average(passedAttempts),
                firstTryRate
            },
            signals: { ...candidate.signals },
            strengths: this.strengths(passedMissions),
            weakAreas: this.weakAreas(candidate.missions),
            experience: {
                years: candidate.member.yearsExperience,
                seniority: this.seniority(candidate.member.yearsExperience)
            },
            completedModules: this.completedModules(candidate.missions)
        };
    }
    strengths(passedMissions) {
        return passedMissions
            .filter((mission) => (mission.attempts ?? FIRST_TRY_ATTEMPTS) <= FIRST_TRY_ATTEMPTS)
            .map((mission) => ({ day: mission.day, title: this.titleFor(mission) }));
    }
    weakAreas(missions) {
        const weakAreas = [];
        for (const mission of missions) {
            const title = this.titleFor(mission);
            if (mission.skipped) {
                weakAreas.push({ day: mission.day, title, reason: "skipped" });
            }
            else if (!mission.passed) {
                weakAreas.push({ day: mission.day, title, reason: "failed", attempts: mission.attempts });
            }
            else if ((mission.attempts ?? 0) >= STRUGGLE_ATTEMPTS) {
                weakAreas.push({ day: mission.day, title, reason: "struggled", attempts: mission.attempts });
            }
        }
        const severity = {
            failed: 0,
            struggled: 1,
            skipped: 2
        };
        return weakAreas.sort((a, b) => severity[a.reason] - severity[b.reason] || a.day - b.day);
    }
    completedModules(missions) {
        const completed = new Set(missions.filter((mission) => mission.passed).map((mission) => mission.day));
        const skipped = new Set(missions.filter((mission) => mission.skipped).map((mission) => mission.day));
        const failed = new Set(missions.filter((mission) => !mission.passed && !mission.skipped).map((mission) => mission.day));
        return this.curriculum.modules.map((module) => {
            const moduleDays = module.days;
            const moduleCompletedDays = moduleDays.filter((day) => completed.has(day));
            const moduleSkippedDays = moduleDays.filter((day) => skipped.has(day));
            const moduleFailedDays = moduleDays.filter((day) => failed.has(day));
            return {
                moduleNumber: module.n,
                title: module.title,
                days: moduleDays,
                completedDays: moduleCompletedDays,
                skippedDays: moduleSkippedDays,
                failedDays: moduleFailedDays,
                completionRate: moduleDays.length ? Number((moduleCompletedDays.length / moduleDays.length).toFixed(2)) : 0
            };
        });
    }
    titleFor(mission) {
        return this.dayMap.get(mission.day)?.title ?? mission.title;
    }
    seniority(years) {
        if (years >= 8)
            return "senior";
        if (years >= 4)
            return "mid";
        return "emerging";
    }
}
