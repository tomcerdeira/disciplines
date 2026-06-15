#!/usr/bin/env node

import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "disciplines-pack-"));
  const { stdout } = await execFileAsync("npm", ["pack", "--json", "--pack-destination", tmp], { cwd: root });
  const [pack] = JSON.parse(stdout);
  const tarball = path.join(tmp, pack.filename);

  const listing = await execFileAsync("tar", ["-tf", tarball]);
  for (const expected of [
    "package/catalog/disciplines.json",
    "package/dist/disciplines.js",
    "package/src/disciplines.ts",
    "package/package.json",
  ]) {
    assert(listing.stdout.includes(expected), `package is missing ${expected}`);
  }

  await execFileAsync("npm", ["exec", "--yes", "--package", tarball, "--", "disciplines", "list", "--global"], {
    cwd: tmp,
    env: { ...process.env, HOME: path.join(tmp, "home") },
  });

  const help = await execFileAsync("npm", ["exec", "--yes", "--package", tarball, "--", "disciplines", "--help"], {
    cwd: tmp,
    env: { ...process.env, HOME: path.join(tmp, "home-help") },
  });
  assert(help.stdout.includes("Usage:"), "packaged CLI --help did not print usage");

  const version = await execFileAsync("npm", ["exec", "--yes", "--package", tarball, "--", "disciplines", "--version"], {
    cwd: tmp,
    env: { ...process.env, HOME: path.join(tmp, "home-version") },
  });
  assert(version.stdout.trim() === pack.version, "packaged CLI --version did not print package version");

  const consumer = path.join(tmp, "consumer");
  await mkdir(consumer);
  await writeFile(path.join(consumer, "package.json"), JSON.stringify({ type: "module", dependencies: { disciplines: tarball } }, null, 2));
  await execFileAsync("npm", ["install", "--silent"], { cwd: consumer });
  const imported = await execFileAsync("node", ["--input-type=module", "-e", "import { formatPromptBundle } from 'disciplines/resolver'; console.log(typeof formatPromptBundle);"], { cwd: consumer });
  assert(imported.stdout.trim() === "function", "packaged resolver export was not importable");

  console.log(`Package smoke check passed (${pack.name}@${pack.version}).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
