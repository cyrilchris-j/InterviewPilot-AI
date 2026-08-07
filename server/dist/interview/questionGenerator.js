import { normalizeKey } from "../utils/text.js";
const stems = {
    easy: [
        "How would you explain",
        "Imagine you are pairing with a teammate. How would you help them understand",
        "What signals would tell you that a learner understands"
    ],
    medium: [
        "Imagine this is failing in a real project. How would you diagnose",
        "How would you design a practical approach for",
        "What tradeoffs would you consider while implementing"
    ],
    hard: [
        "You are reviewing this for production readiness. How would you challenge",
        "Suppose scale, latency, and correctness all matter. How would you architect",
        "A team ships this and quality regresses. How would you investigate"
    ]
};
export class QuestionGenerator {
    generate(planItem, askedKeys, previousEvaluation) {
        const difficulty = planItem.difficulty;
        const stemList = stems[difficulty];
        const offset = previousEvaluation?.score && previousEvaluation.score < 3 ? 1 : planItem.index % stemList.length;
        const stem = stemList[offset % stemList.length];
        const focus = this.readableFocus(planItem.objective);
        const follow = previousEvaluation?.score && previousEvaluation.score < 3
            ? "Keep it concrete and start with the first step you would take."
            : "I am interested in your reasoning, not a memorized definition.";
        let text = `${stem} ${focus} from Day ${planItem.day.day} (${planItem.day.title})? ${follow}`;
        if (planItem.questionType === "Debugging") {
            text = `Imagine retrieval or generation quality is worse than expected in a project tied to Day ${planItem.day.day}. How would you debug ${planItem.objective.toLowerCase()}?`;
        }
        if (planItem.questionType === "Tradeoff") {
            text = `What tradeoffs would you weigh when applying ${planItem.objective.toLowerCase()} in a production AI system?`;
        }
        if (planItem.questionType === "Follow-up") {
            text = `Looking back across this interview, pick one risk in ${planItem.day.title}. How would you reduce that risk before a demo or launch?`;
        }
        let key = normalizeKey(text);
        let suffix = 1;
        while (askedKeys.has(key)) {
            suffix += 1;
            text = `${text} Please use a different example than before.`;
            key = `${normalizeKey(text)}-${suffix}`;
        }
        askedKeys.add(key);
        return {
            id: `q-${planItem.index}-${planItem.day.day}`,
            index: planItem.index,
            text,
            day: planItem.day.day,
            dayTitle: planItem.day.title,
            objective: planItem.objective,
            stage: planItem.stage,
            type: planItem.questionType,
            difficulty
        };
    }
    readableFocus(objective) {
        return objective
            .replace(/^Understand\s+/i, "")
            .replace(/^Learn\s+/i, "")
            .replace(/^Create\s+/i, "creating ")
            .replace(/^Build\s+/i, "building ")
            .replace(/^Implement\s+/i, "implementing ")
            .replace(/^Configure\s+/i, "configuring ")
            .toLowerCase();
    }
}
