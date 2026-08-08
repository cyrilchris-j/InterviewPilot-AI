import { Project } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const domains = ["ai", "candidate", "curriculum", "evaluation", "feedback", "interview", "memory", "planner", "sessions"];
const infra = ["config", "controllers", "errors", "logger", "middleware", "routes", "services", "types", "utils", "validation"];

fs.mkdirSync("src/domains", { recursive: true });
fs.mkdirSync("src/infrastructure", { recursive: true });

for (const dir of domains) {
  if (fs.existsSync(`src/${dir}`)) {
    const directory = project.getDirectory(`src/${dir}`);
    if (directory) {
      directory.move(path.join(process.cwd(), `src/domains/${dir}`));
    }
  }
}

for (const dir of infra) {
  if (fs.existsSync(`src/${dir}`)) {
    const directory = project.getDirectory(`src/${dir}`);
    if (directory) {
      directory.move(path.join(process.cwd(), `src/infrastructure/${dir}`));
    }
  }
}

project.saveSync();
console.log("Done");
