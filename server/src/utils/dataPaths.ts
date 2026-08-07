import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const dataPath = (fileName: string) => path.join(currentDir, "..", "..", "data", fileName);
export const promptPath = (fileName: string) => path.join(currentDir, "..", "..", "..", "prompts", fileName);
