import { normalizeKey } from "../utils/text.js";
const QUOTE_LIMIT = 40;
/**
 * Deterministic question generator. Produces senior-engineer-grade questions
 * grounded in the curriculum day, the candidate profile, the interview plan,
 * and — for follow-ups — the candidate's previous answer and evaluation.
 * Used by the engine as the offline fallback when AI is unavailable.
 */
export class QuestionGenerator {
    generate(planItem, context) {
        const build = this.buildContext(planItem, context);
        let text;
        switch (planItem.questionType) {
            case "Follow-up":
                text = this.buildReflectiveFollowUp(build);
                break;
            case "Scenario":
                text = this.buildScenario(build);
                break;
            case "Architecture":
                text = this.buildArchitecture(build);
                break;
            case "Debugging":
                text = this.buildDebugging(build);
                break;
            case "Production":
                text = this.buildProduction(build);
                break;
            case "Tradeoff":
                text = this.buildTradeoff(build);
                break;
            case "Failure Analysis":
                text = this.buildFailureAnalysis(build);
                break;
            default:
                text = this.buildConcept(build);
                break;
        }
        return this.dedup(planItem, text, context.askedKeys);
    }
    followUp(planItem, context) {
        const build = this.buildContext(planItem, context);
        const text = build.previousEvaluation && build.previousAnswer
            ? this.buildAdaptiveFollowUp(build)
            : this.buildReflectiveFollowUp(build);
        return this.dedup(planItem, text, context.askedKeys, "follow-up");
    }
    toInterviewQuestion(planItem, text, tag) {
        const idTag = tag ? `-${tag}` : "";
        return {
            id: `q-${planItem.index}-${planItem.day.day}${idTag}`,
            index: planItem.index,
            text,
            day: planItem.day.day,
            dayTitle: planItem.day.title,
            objective: planItem.objective,
            stage: planItem.stage,
            type: planItem.questionType,
            difficulty: planItem.difficulty
        };
    }
    buildConcept(build) {
        const focus = this.focusPhrase(build.objective);
        const scaffold = build.weakArea
            ? ` Because this was a gap for you on Day ${build.day.day}, start with the core idea before the production details. `
            : "";
        const deepen = build.strongArea
            ? " You aced this area, so push past the happy path."
            : "";
        if (build.difficulty === "easy") {
            return (`Walk me through ${focus} on Day ${build.day.day} (${build.day.title}) the way you would for a senior engineer joining the team` +
                `${scaffold} What would you want their mental model to capture — not a definition, the behavior.`);
        }
        if (build.difficulty === "medium") {
            return (`We lean on ${this.tools(build)} every day in the chatbot. Walk me through ${focus} in our healthcare context and then name the first thing that would look wrong in production` +
                `${scaffold} — where do those signals actually surface?`);
        }
        return (`Explain ${focus} as if you were defending it in a design review, then tell me the two quietest ways it degrades in production` +
            `${deepen} How would you notice them before a user does?`);
    }
    buildScenario(build) {
        const focus = this.focusPhrase(build.objective);
        const reiterateStruggling = build.weakArea
            ? ` Since Day ${build.day.day} was rough for you, keep the walk-through concrete and show your first step.`
            : "";
        if (build.difficulty === "easy") {
            return (`A teammate on the healthcare chatbot asks for a coverage question that hinges on ${focus} from Day ${build.day.day} (${build.day.title}).` +
                ` Walk me through the request from the API boundary to the answer — where does the real work happen?${reiterateStruggling}`);
        }
        if (build.difficulty === "medium") {
            return (`A user asks a question that spans both a structured plan lookup and the messy edge cases of ${focus}. ` +
                `Trace the request end to end and explain when you would merge results versus trust one source.`);
        }
        return (`Leadership wants the chatbot to answer a fully novel, multi-source healthcare question grounded in ${focus}. ` +
            `Walk through how you compose the answer, and where you stop trusting each source when the answers conflict.`);
    }
    buildArchitecture(build) {
        const focus = this.focusPhrase(build.objective);
        if (build.difficulty === "easy") {
            return (`Sketch the components you would wire together to make ${focus} work on Day ${build.day.day} (${build.day.title}). ` +
                `Where does each piece live, and what do you connect to what?`);
        }
        if (build.difficulty === "medium") {
            return (`Design the backend for ${focus}: where do ${this.tools(build)} sit, how does state flow, ` +
                `and what do you add so a second healthcare domain can hook in without re-wiring the core?`);
        }
        return (`You are designing the production architecture for a chatbot whose core capability is ${focus}. ` +
            `Show me the pieces, the seams between them, how you'd fail one piece in isolation, and which single latency you'd put on-call in front of.`);
    }
    buildDebugging(build) {
        const focus = this.focusPhrase(build.objective);
        if (build.difficulty === "easy") {
            return (`One user complaint quietly becomes a trend: answers tied to ${focus} are confidently wrong. ` +
                `Give me your first three concrete steps to isolate whether this is the data, the retrieval, or the prompt.`);
        }
        if (build.difficulty === "medium") {
            return (`You shipped a change that touches ${focus} today and retrieval quality reports dropped 40%. ` +
                `How do you bisect that to a single root cause without shipping more changes, and what metric proves you fixed it?`);
        }
        return (`Users report that answers tied to ${focus} are spotless for English queries but subtly wrong for the same question in another language. ` +
            `What's your thesis, how do you prove it, and what production evidence do you pull to confirm before you touch anything?`);
    }
    buildProduction(build) {
        const focus = this.focusPhrase(build.objective);
        if (build.difficulty === "easy") {
            return (`You're on call for ${focus} on Day ${build.day.day} (${build.day.title}) in production. ` +
                `What does "healthy" look like, and who or what notices if it silently regresses?`);
        }
        if (build.difficulty === "medium") {
            return (`You're shipping a production launch that relies on ${focus}. Walk me through the launch checklist — ` +
                `canary, the latency and quality gates you gate on, what you have a rollback, and the first page you look at when it goes green.`);
        }
        return (`An incident pager wakes you right in the middle of ${focus}: the team realizes ${this.tools(build)} "looks healthy" while users still get wrong answers. ` +
            `Design the production telemetry and the runbook that would have caught it, and tell me the decision that rolls it back.`);
    }
    buildTradeoff(build) {
        const [optionA, optionB] = this.twoTools(build);
        const focus = this.focusPhrase(build.objective);
        if (build.difficulty === "easy") {
            return (`We could approach ${focus} two different ways${this.optionPair(optionA, optionB)}. ` +
                `Which do you reach for first for this chatbot, and what trade-off are you accepting — latency, ops load, or fidelity — before you would switch?`);
        }
        if (build.difficulty === "medium") {
            return (`Pick between ${optionA ?? "a hosted solution"} and ${optionB ?? "building it in-house"} for ${focus} on ${build.day.title}. ` +
                `Make your call as the engineer on the page: what does it cost in ops, latency, and fixability, and when would you happily switch it?`);
        }
        return (`We have budget for exactly one strategy to carry ${focus} to production-grade. Compare ${optionA ?? "a managed option"} against ${optionB ?? "an open-ended internal build"}: ` +
            `walk through cost, blast radius, debuggability, and how easily we could revert if we're wrong — then commit to one and defend it.`);
    }
    buildFailureAnalysis(build) {
        const focus = this.focusPhrase(build.objective);
        return build.difficulty === "hard"
            ? `Where does ${focus}, running on ${this.tools(build)}, silently fall apart in a live healthcare flow — and what telemetry would expose each failure within a paging window?`
            : build.difficulty === "medium"
                ? `${this.capitalize(focus)} is returning plausible-but-wrong outcomes at low volume. Enumerate the believable root causes and which one you'd bet on first.`
                : `What are the quiet ways ${focus} can fail in the chatbot, and how would a user suffer before anyone notices? Pick the risk that scares you most and explain why.`;
    }
    buildAdaptiveFollowUp(build) {
        const evaluation = build.previousEvaluation;
        const answer = build.previousAnswer;
        const quote = this.quote(answer);
        const verdictHook = evaluation.verdict === "weak"
            ? " That landed too high-level for me."
            : evaluation.verdict === "mixed"
                ? " That direction is right, but it needs to be concrete."
                : " Good — now take it one level deeper.";
        return (`You said "${quote}".${verdictHook} ${evaluation.followUpHint}` +
            ` On ${build.day.title} (Day ${build.day.day}), walk me through the exact first thing you would execute and the number you measured to know it worked.`);
    }
    buildReflectiveFollowUp(build) {
        if (build.previousAnswer && build.previousEvaluation) {
            return this.buildAdaptiveFollowUp(build);
        }
        return `Looking back across this interview, pick one risk in ${build.day.title} we did not get to cover. How would you reduce that risk before a production demo?`;
    }
    dedup(planItem, text, askedKeys, tag) {
        let uniqueCreate = text;
        let suffix = 1;
        let key = normalizeKey(uniqueCreate);
        while (askedKeys.has(key)) {
            suffix += 1;
            uniqueCreate = `${text} Please approach it from a different angle than before.`;
            key = `${normalizeKey(uniqueCreate)}-${suffix}`;
        }
        askedKeys.add(key);
        return this.toInterviewQuestion(planItem, uniqueCreate, tag);
    }
    buildContext(planItem, context) {
        return {
            day: planItem.day,
            objective: planItem.objective,
            difficulty: planItem.difficulty,
            stage: planItem.stage,
            questionType: planItem.questionType,
            seniority: context.candidate.seniority,
            weakArea: context.candidate.weakDays.includes(planItem.day.day),
            strongArea: context.candidate.strongDays.includes(planItem.day.day),
            previousEvaluation: context.previousEvaluation,
            previousAnswer: context.previousAnswer
        };
    }
    tools(build) {
        return build.day.tools.length ? build.day.tools.slice(0, 3).join(", ") : "the pipeline";
    }
    twoTools(build) {
        const options = build.day.tools.filter((tool) => !["Python", "FastAPI", "React"].includes(tool));
        return options.length >= 2 ? [options[0], options[1]] : [options[0] ?? undefined, undefined];
    }
    optionPair(optionA, optionB) {
        if (optionA && optionB)
            return ` — ${optionA} or ${optionB}`;
        return optionA ? ` — ${optionA} versus a hand-rolled fallback` : " — a hosted service versus a hand-rolled fallback";
    }
    focusPhrase(objective) {
        const stripped = objective.replace(/^Understand\s+/i, "").replace(/^Learn\s+/i, "");
        if (stripped !== objective) {
            return stripped.charAt(0).toLowerCase() + stripped.slice(1);
        }
        const [verb, ...rest] = objective.split(/\s+/);
        const gerund = QuestionGenerator.GERUNDS[verb.toLowerCase()];
        if (!gerund) {
            return objective.charAt(0).toLowerCase() + objective.slice(1);
        }
        return [gerund, ...rest].map((word) => this.gerundInterior(word)).join(" ");
    }
    gerundInterior(word) {
        const gerund = QuestionGenerator.GERUNDS[word.toLowerCase()];
        return gerund && QuestionGenerator.SECONDARY_VERBS.has(word.toLowerCase()) ? gerund : word;
    }
    static SECONDARY_VERBS = new Set([
        "activate",
        "clean",
        "commit",
        "debug",
        "deduplicate",
        "download",
        "fine-tune",
        "normalize",
        "organize",
        "publish",
        "sanitize"
    ]);
    static GERUNDS = {
        install: "installing",
        configure: "configuring",
        create: "creating",
        run: "running",
        verify: "verifying",
        connect: "connecting",
        generate: "generating",
        confirm: "confirming",
        build: "building",
        scaffold: "scaffolding",
        load: "loading",
        store: "storing",
        write: "writing",
        document: "documenting",
        extract: "extracting",
        perform: "performing",
        scrape: "scraping",
        clean: "cleaning",
        convert: "converting",
        split: "splitting",
        attach: "attaching",
        train: "training",
        validate: "validating",
        test: "testing",
        evaluate: "evaluating",
        set: "setting",
        compare: "comparing",
        select: "selecting",
        merge: "merging",
        implement: "implementing",
        define: "defining",
        design: "designing",
        finalize: "finalizing",
        log: "logging",
        identify: "identifying",
        prepare: "preparing",
        measure: "measuring",
        optimize: "optimizing",
        integrate: "integrating",
        maintain: "maintaining",
        add: "adding",
        handle: "handling",
        display: "displaying",
        render: "rendering",
        ensure: "ensuring",
        persist: "persisting",
        wrap: "wrapping",
        analyze: "analyzing",
        expose: "exposing",
        replace: "replacing",
        protect: "protecting",
        containerize: "containerizing",
        deploy: "deploying",
        track: "tracking",
        demonstrate: "demonstrating",
        fix: "fixing",
        showcase: "showcasing",
        present: "presenting",
        establish: "establishing",
        debug: "debugging",
        summarize: "summarizing",
        enforce: "enforcing",
        review: "reviewing",
        "fine-tune": "fine-tuning",
        secure: "securing",
        normalize: "normalizing"
    };
    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    quote(answer) {
        const singleLine = answer.replace(/\s+/g, " ").trim();
        return singleLine.length > QUOTE_LIMIT ? singleLine.slice(0, QUOTE_LIMIT) + "…" : singleLine;
    }
}
