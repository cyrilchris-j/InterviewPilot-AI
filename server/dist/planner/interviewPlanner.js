import { unique } from "../utils/text.js";
const PLAN_SIZE = 8;
const MIN_DISTINCT_DAYS = 4;
const DEFAULT_ROADMAP = [
    { stage: "Warmup", questionType: "Concept" },
    { stage: "Concept", questionType: "Concept" },
    { stage: "Scenario", questionType: "Scenario" },
    { stage: "Architecture", questionType: "Architecture" },
    { stage: "Tradeoff", questionType: "Tradeoff" },
    { stage: "Production", questionType: "Production" },
    { stage: "Advanced", questionType: "Architecture" },
    { stage: "Reflection", questionType: "Follow-up" }
];
/** Style-biased roadmaps for onboarding interview-type preferences. */
const STYLE_ROADMAPS = {
    Technical: DEFAULT_ROADMAP,
    Behavioral: [
        { stage: "Warmup", questionType: "Concept" },
        { stage: "Scenario", questionType: "Scenario" },
        { stage: "Scenario", questionType: "Scenario" },
        { stage: "Tradeoff", questionType: "Tradeoff" },
        { stage: "Production", questionType: "Production" },
        { stage: "Scenario", questionType: "Failure Analysis" },
        { stage: "Reflection", questionType: "Follow-up" },
        { stage: "Reflection", questionType: "Follow-up" }
    ],
    "System Design": [
        { stage: "Warmup", questionType: "Concept" },
        { stage: "Architecture", questionType: "Architecture" },
        { stage: "Architecture", questionType: "Architecture" },
        { stage: "Tradeoff", questionType: "Tradeoff" },
        { stage: "Production", questionType: "Production" },
        { stage: "Advanced", questionType: "Architecture" },
        { stage: "Scenario", questionType: "Scenario" },
        { stage: "Reflection", questionType: "Follow-up" }
    ],
    Coding: [
        { stage: "Warmup", questionType: "Concept" },
        { stage: "Scenario", questionType: "Scenario" },
        { stage: "Scenario", questionType: "Debugging" },
        { stage: "Architecture", questionType: "Architecture" },
        { stage: "Production", questionType: "Production" },
        { stage: "Scenario", questionType: "Debugging" },
        { stage: "Tradeoff", questionType: "Tradeoff" },
        { stage: "Reflection", questionType: "Follow-up" }
    ],
    Mixed: DEFAULT_ROADMAP
};
export class InterviewPlanner {
    createPlan(profile, curriculum, userProfile) {
        const daysByNumber = new Map(curriculum.days.map((day) => [day.day, day]));
        const selectedDays = this.selectDays(profile, curriculum, daysByNumber);
        this.assertInDays(selectedDays);
        const styleKey = userProfile?.interviewType ?? "Mixed";
        const roadmapTemplate = STYLE_ROADMAPS[styleKey] ?? DEFAULT_ROADMAP;
        const difficultyBias = this.difficultyBias(userProfile?.difficulty);
        const roadmap = selectedDays.map((day, position) => ({
            position: position + 1,
            stage: roadmapTemplate[position].stage,
            questionType: roadmapTemplate[position].questionType,
            day: day.day,
            dayTitle: day.title,
            difficulty: this.difficultyFor(position, profile.experience.seniority, difficultyBias)
        }));
        const items = roadmap.map((step, position) => {
            const day = daysByNumber.get(step.day);
            return {
                index: position + 1,
                stage: step.stage,
                day,
                objective: this.pickObjective(day, position),
                questionType: step.questionType,
                difficulty: step.difficulty,
                rationale: this.rationaleFor(profile, step.day, userProfile)
            };
        });
        return {
            totalQuestions: PLAN_SIZE,
            uniqueDays: unique(items.map((item) => item.day.day)),
            roadmap,
            items
        };
    }
    selectDays(profile, curriculum, daysByNumber) {
        const completedDayNumbers = [...profile.completedDays].sort((a, b) => a - b);
        const strengthDays = profile.strengths.map((strength) => strength.day);
        const weakDays = profile.weakAreas.map((area) => area.day);
        const explored = new Set([...completedDayNumbers, ...weakDays]);
        const completedOrdered = unique([...strengthDays, ...completedDayNumbers]);
        const remainingOrdered = curriculum.days
            .filter((day) => !explored.has(day.day))
            .map((day) => day.day)
            .sort((a, b) => a - b);
        const orderedDayNumbers = unique([...completedOrdered, ...weakDays, ...remainingOrdered]).slice(0, PLAN_SIZE);
        return orderedDayNumbers.map((dayNumber) => daysByNumber.get(dayNumber));
    }
    assertInDays(selected) {
        if (selected.length < PLAN_SIZE) {
            throw new Error(`Interview plan requires ${PLAN_SIZE} topics but only ${selected.length} curriculum days are available.`);
        }
        if (new Set(selected.map((day) => day.day)).size < MIN_DISTINCT_DAYS) {
            throw new Error(`Interview plan must cover at least ${MIN_DISTINCT_DAYS} distinct curriculum days.`);
        }
    }
    difficultyBias(preference) {
        switch (preference) {
            case "Easy":
                return -1;
            case "Hard":
            case "Senior":
                return 1;
            case "Staff":
                return 2;
            default:
                return 0;
        }
    }
    difficultyFor(position, seniority, bias = 0) {
        const levels = ["easy", "medium", "hard"];
        let base = 0;
        if (position >= 5)
            base = 2;
        else if (position >= 2)
            base = 1;
        else
            base = seniority === "senior" ? 1 : 0;
        return levels[Math.max(0, Math.min(2, base + bias))];
    }
    rationaleFor(profile, dayNumber, userProfile) {
        const target = userProfile?.company && userProfile?.targetRole
            ? ` Calibrate for a ${userProfile.targetRole} bar at ${userProfile.company}.`
            : "";
        const weakArea = profile.weakAreas.find((area) => area.day === dayNumber);
        if (weakArea) {
            const reason = weakArea.reason === "failed"
                ? "was not completed; probe fundamentals before deepening"
                : weakArea.reason === "struggled"
                    ? `needed ${weakArea.attempts} attempts; probe understanding before increasing difficulty`
                    : "was skipped; verify the material was self-studied";
            return `Day ${dayNumber} ${reason}.${target}`;
        }
        if (profile.strengths.some((strength) => strength.day === dayNumber)) {
            return `Day ${dayNumber} was completed on the first attempt; use it to test depth and transfer.${target}`;
        }
        if (profile.completedDays.includes(dayNumber)) {
            return `Day ${dayNumber} was completed; reinforce it before moving on.${target}`;
        }
        return `Day ${dayNumber} rounds out end-to-end AI engineering readiness.${target}`;
    }
    pickObjective(day, position) {
        return day.objectives[position % day.objectives.length];
    }
}
