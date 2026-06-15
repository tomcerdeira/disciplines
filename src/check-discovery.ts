#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const cli = path.join(root, "dist", "disciplines.js");

const catalogEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  source: z.string().min(1),
  discipline: z.string().min(1),
  tags: z.array(z.string().min(1)),
  agents: z.array(z.string().min(1)),
  tools: z.array(z.string().min(1)),
}).strict();

const catalogSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string().min(1),
  disciplines: z.array(catalogEntrySchema),
}).strict();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run(args) {
  return execFileAsync("node", [cli, ...args], {
    cwd: root,
    env: { ...process.env, NO_COLOR: "1" },
  });
}

async function main() {
  const catalogPath = path.join(root, "catalog", "disciplines.json");
  const catalog = catalogSchema.parse(JSON.parse(await readFile(catalogPath, "utf8")));
  const ids = new Set();

  for (const entry of catalog.disciplines) {
    assert(!ids.has(entry.id), `duplicate catalog id: ${entry.id}`);
    ids.add(entry.id);
    assert(entry.id === entry.discipline, `${entry.id} catalog discipline should match the bundled id`);
    assert(entry.source === "tomcerdeira/disciplines", `${entry.id} should point at the public disciplines repo`);
    assert(existsSync(path.join(root, "disciplines", entry.discipline, "DISCIPLINE.md")), `${entry.id} catalog target is missing`);
  }

  const catalogOutput = await run(["catalog"]);
  assert(catalogOutput.stdout.includes("catalog\t") || catalogOutput.stdout.includes("empty\tcatalog"), "catalog command did not print a summary");

  const searchOutput = await run(["search", "react", "--verbose"]);
  assert(searchOutput.stdout.includes("catalog\t") || searchOutput.stdout.includes("empty\tcatalog"), "search command did not print a summary");

  const adapterFiles = [
    "templates/meta-skill/agent-disciplines/SKILL.md",
    "templates/repo-instructions/AGENTS.md",
    "templates/repo-instructions/CLAUDE.md",
    "templates/repo-instructions/cursor-rule.md",
    "templates/commands/discipline.md",
  ];

  for (const relativePath of adapterFiles) {
    const content = await readFile(path.join(root, relativePath), "utf8");
    assert(content.includes("npx disciplines use installed") || content.includes("<AGENT_DISCIPLINES_COMMAND>"), `${relativePath} does not invoke discipline resolution`);
    assert(content.includes("advisory") || content.includes("task-local"), `${relativePath} does not preserve advisory/task-local wording`);
    assert(content.includes("prepare") || content.includes("missing or unknown"), `${relativePath} does not instruct agents to check readiness before relying on capabilities`);
  }

  console.log("Discovery and adapter check passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
