import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
const DEFAULT_PROMPTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "prompts");
function defaultPromptsDir() {
    return DEFAULT_PROMPTS_DIR;
}
export class PromptStore {
    directory;
    cache = new Map();
    constructor(directory = defaultPromptsDir()) {
        this.directory = directory;
    }
    load(name) {
        const cached = this.cache.get(name);
        if (cached !== undefined)
            return cached;
        const filePath = resolve(this.directory, `${name}.md`);
        if (!existsSync(filePath)) {
            throw new Error(`Prompt file not found: ${filePath}`);
        }
        const content = readFileSync(filePath, "utf8");
        this.cache.set(name, content);
        return content;
    }
    render(name, variables = {}) {
        const template = this.load(name);
        return template.replace(PLACEHOLDER_PATTERN, (_match, key) => {
            if (!(key in variables)) {
                throw new Error(`Prompt "${name}" references unknown variable "{{${key}}}".`);
            }
            return variables[key];
        });
    }
}
