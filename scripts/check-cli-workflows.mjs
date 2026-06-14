#!/usr/bin/env node

import { mkdtemp, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const cli = path.join(root, "scripts", "disciplines.mjs");

async function run(args, options = {}) {
  return execFileAsync("node", [cli, ...args], {
    cwd: options.cwd ?? root,
    env: { ...process.env, ...(options.env ?? {}) },
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const projectDir = await mkdtemp(path.join(os.tmpdir(), "disciplines-project-"));

  await run(["add", root, "--discipline", "frontend-engineer", "--project", "--yes"], { cwd: projectDir });

  const projectList = await run(["list", "--project"], { cwd: projectDir });
  assert(projectList.stdout.includes("project\tfrontend-engineer"), "project list did not include frontend-engineer");

  const projectFind = await run(["find", "react", "--project"], { cwd: projectDir });
  assert(projectFind.stdout.includes("frontend-engineer"), "project find did not include frontend-engineer");

  const projectUse = await run(["use", "installed", "--task", "Fix keyboard navigation", "--file", "src/components/SearchResults.tsx"], { cwd: projectDir });
  assert(projectUse.stdout.includes("Selected disciplines:"), "use installed did not print resolver bundle");
  assert(projectUse.stdout.includes("frontend-engineer"), "use installed did not select frontend-engineer");

  await run(["remove", "frontend-engineer", "--project", "--yes"], { cwd: projectDir });
  const projectListAfterRemove = await run(["list", "--project"], { cwd: projectDir });
  assert(!projectListAfterRemove.stdout.includes("frontend-engineer"), "remove did not delete frontend-engineer");

  const globalHome = await mkdtemp(path.join(os.tmpdir(), "disciplines-home-"));
  await run(["add", root, "--discipline", "backend-engineer", "--global", "--copy", "--yes"], {
    env: { HOME: globalHome },
  });
  const globalList = await run(["list", "--global"], { env: { HOME: globalHome } });
  assert(globalList.stdout.includes("global\tbackend-engineer"), "global list did not include backend-engineer");
  const globalUpdate = await run(["update", "backend-engineer", "--global"], { env: { HOME: globalHome } });
  assert(globalUpdate.stdout.includes("update global\tbackend-engineer"), "global update did not update backend-engineer");

  const initDir = await mkdtemp(path.join(os.tmpdir(), "disciplines-init-"));
  await run(["init", "software-engineer"], { cwd: initDir });
  const initialized = path.join(initDir, "software-engineer", "DISCIPLINE.md");
  assert(existsSync(initialized), "init did not create DISCIPLINE.md");
  assert((await readFile(initialized, "utf8")).includes("id: software-engineer"), "init did not set id");

  const explicitUse = await run(["use", `${root}@frontend-engineer`]);
  assert(explicitUse.stdout.includes("Selected explicitly."), "source@discipline did not select explicitly");

  console.log("CLI workflow check passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
