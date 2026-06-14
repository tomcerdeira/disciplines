#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";

const root = process.cwd();
const schemaPath = path.join(root, "schema", "degree.schema.json");
const degreesDir = path.join(root, "degrees");

const errors = [];

function fail(message) {
  errors.push(message);
}

function splitDegreeFile(source, filePath) {
  if (!source.startsWith("---\n")) {
    fail(`${filePath}: missing opening frontmatter delimiter`);
    return null;
  }

  const end = source.indexOf("\n---", 4);
  if (end === -1) {
    fail(`${filePath}: missing closing frontmatter delimiter`);
    return null;
  }

  const frontmatter = source.slice(4, end).trim();
  const body = source.slice(end + 4).trim();

  if (!frontmatter) fail(`${filePath}: empty frontmatter`);
  if (!body) fail(`${filePath}: empty markdown body`);

  return { frontmatter, body };
}

function parseFrontmatterYaml(source, filePath) {
  try {
    const data = YAML.parse(source);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      fail(`${filePath}: frontmatter must be a YAML object`);
      return {};
    }
    return data;
  } catch (error) {
    fail(`${filePath}: invalid YAML frontmatter: ${error.message}`);
    return {};
  }
}

function expectString(data, key, filePath) {
  if (typeof data[key] !== "string" || data[key].trim() === "") {
    fail(`${filePath}: ${key} must be a non-empty string`);
  }
}

function expectStringArray(data, key, filePath, { allowEmpty = false } = {}) {
  if (!Array.isArray(data[key])) {
    fail(`${filePath}: ${key} must be an array`);
    return;
  }

  if (!allowEmpty && data[key].length === 0) {
    fail(`${filePath}: ${key} must not be empty`);
  }

  data[key].forEach((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      fail(`${filePath}: ${key}[${index}] must be a non-empty string`);
    }
  });

  const unique = new Set(data[key]);
  if (unique.size !== data[key].length) {
    fail(`${filePath}: ${key} must not contain duplicates`);
  }
}

function validateDegree(data, filePath, schema, seenIds) {
  const allowedKeys = new Set(Object.keys(schema.properties));
  const requiredKeys = schema.required;

  for (const key of requiredKeys) {
    if (!(key in data)) fail(`${filePath}: missing required field ${key}`);
  }

  for (const key of Object.keys(data)) {
    if (!allowedKeys.has(key)) fail(`${filePath}: unknown field ${key}`);
  }

  expectString(data, "id", filePath);
  expectString(data, "name", filePath);
  expectString(data, "version", filePath);
  expectString(data, "description", filePath);
  expectStringArray(data, "includeSkills", filePath);
  expectStringArray(data, "softExcludeSkills", filePath, { allowEmpty: true });

  if ("aliases" in data) expectStringArray(data, "aliases", filePath, { allowEmpty: true });
  if ("notes" in data) expectString(data, "notes", filePath);

  if ("confidenceThreshold" in data) {
    const threshold = data.confidenceThreshold;
    if (typeof threshold !== "number" || threshold < 0 || threshold > 1) {
      fail(`${filePath}: confidenceThreshold must be a number from 0 to 1`);
    }
  }

  if (typeof data.id === "string") {
    const idPattern = new RegExp(schema.properties.id.pattern);
    if (!idPattern.test(data.id)) fail(`${filePath}: id does not match ${idPattern}`);
    if (seenIds.has(data.id)) fail(`${filePath}: duplicate degree id ${data.id}`);
    seenIds.add(data.id);
  }

  if (typeof data.version === "string") {
    const versionPattern = new RegExp(schema.properties.version.pattern);
    if (!versionPattern.test(data.version)) {
      fail(`${filePath}: version does not match semver pattern`);
    }
  }

  const skillPattern = new RegExp(schema.$defs.skillId.pattern);
  for (const key of ["includeSkills", "softExcludeSkills"]) {
    if (!Array.isArray(data[key])) continue;
    for (const skill of data[key]) {
      if (typeof skill === "string" && !skillPattern.test(skill)) {
        fail(`${filePath}: ${key} contains invalid skill id ${skill}`);
      }
    }
  }

  validateRecommendedTools(data.recommendedTools, filePath, schema);
  validateActivation(data.activation, filePath);
}

function validateRecommendedTools(tools, filePath, schema) {
  if (!Array.isArray(tools)) {
    fail(`${filePath}: recommendedTools must be an array`);
    return;
  }

  const toolPattern = new RegExp(schema.$defs.toolRecommendation.properties.id.pattern);
  const allowedKinds = new Set(schema.$defs.toolRecommendation.properties.kind.enum);
  const allowedKeys = new Set(Object.keys(schema.$defs.toolRecommendation.properties));
  const seen = new Set();

  tools.forEach((tool, index) => {
    if (!tool || typeof tool !== "object" || Array.isArray(tool)) {
      fail(`${filePath}: recommendedTools[${index}] must be an object`);
      return;
    }

    for (const key of schema.$defs.toolRecommendation.required) {
      if (!(key in tool)) fail(`${filePath}: recommendedTools[${index}] missing ${key}`);
    }

    for (const key of Object.keys(tool)) {
      if (!allowedKeys.has(key)) {
        fail(`${filePath}: recommendedTools[${index}] has unknown field ${key}`);
      }
    }

    if (typeof tool.id !== "string" || !toolPattern.test(tool.id)) {
      fail(`${filePath}: recommendedTools[${index}].id is invalid`);
    }

    if (typeof tool.kind !== "string" || !allowedKinds.has(tool.kind)) {
      fail(`${filePath}: recommendedTools[${index}].kind is invalid`);
    }

    if (typeof tool.purpose !== "string" || tool.purpose.trim() === "") {
      fail(`${filePath}: recommendedTools[${index}].purpose must be a non-empty string`);
    }

    if ("when" in tool && (typeof tool.when !== "string" || tool.when.trim() === "")) {
      fail(`${filePath}: recommendedTools[${index}].when must be a non-empty string`);
    }

    if ("optional" in tool && typeof tool.optional !== "boolean") {
      fail(`${filePath}: recommendedTools[${index}].optional must be a boolean`);
    }

    if (typeof tool.id === "string") {
      if (seen.has(tool.id)) fail(`${filePath}: duplicate recommended tool id ${tool.id}`);
      seen.add(tool.id);
    }
  });
}

function validateActivation(activation, filePath) {
  if (!activation || typeof activation !== "object" || Array.isArray(activation)) {
    fail(`${filePath}: activation must be an object`);
    return;
  }

  const allowedKeys = new Set(["pathPatterns", "commandPatterns", "promptSignals", "minScore"]);
  for (const key of Object.keys(activation)) {
    if (!allowedKeys.has(key)) fail(`${filePath}: activation has unknown field ${key}`);
  }

  expectStringArray(activation, "pathPatterns", `${filePath}: activation`, { allowEmpty: true });
  expectStringArray(activation, "commandPatterns", `${filePath}: activation`, { allowEmpty: true });

  if (!("promptSignals" in activation)) {
    fail(`${filePath}: activation missing promptSignals`);
  } else {
    validatePromptSignals(activation.promptSignals, filePath);
  }

  if (!("minScore" in activation)) {
    fail(`${filePath}: activation missing minScore`);
  } else if (typeof activation.minScore !== "number" || activation.minScore < 0) {
    fail(`${filePath}: activation.minScore must be a number greater than or equal to 0`);
  }

  if (Array.isArray(activation.commandPatterns)) {
    activation.commandPatterns.forEach((pattern, index) => {
      if (typeof pattern !== "string") return;
      try {
        new RegExp(pattern);
      } catch (error) {
        fail(`${filePath}: activation.commandPatterns[${index}] is not a valid RegExp: ${error.message}`);
      }
    });
  }
}

function validatePromptSignals(promptSignals, filePath) {
  if (!promptSignals || typeof promptSignals !== "object" || Array.isArray(promptSignals)) {
    fail(`${filePath}: activation.promptSignals must be an object`);
    return;
  }

  const allowedKeys = new Set(["phrases", "allOf", "anyOf", "noneOf"]);
  for (const key of Object.keys(promptSignals)) {
    if (!allowedKeys.has(key)) fail(`${filePath}: activation.promptSignals has unknown field ${key}`);
  }

  expectStringArray(promptSignals, "phrases", `${filePath}: activation.promptSignals`, { allowEmpty: true });
  expectStringArray(promptSignals, "anyOf", `${filePath}: activation.promptSignals`, { allowEmpty: true });
  expectStringArray(promptSignals, "noneOf", `${filePath}: activation.promptSignals`, { allowEmpty: true });

  if (!Array.isArray(promptSignals.allOf)) {
    fail(`${filePath}: activation.promptSignals.allOf must be an array`);
    return;
  }

  promptSignals.allOf.forEach((group, groupIndex) => {
    if (!Array.isArray(group) || group.length === 0) {
      fail(`${filePath}: activation.promptSignals.allOf[${groupIndex}] must be a non-empty string array`);
      return;
    }

    group.forEach((item, itemIndex) => {
      if (typeof item !== "string" || item.trim() === "") {
        fail(`${filePath}: activation.promptSignals.allOf[${groupIndex}][${itemIndex}] must be a non-empty string`);
      }
    });

    if (new Set(group).size !== group.length) {
      fail(`${filePath}: activation.promptSignals.allOf[${groupIndex}] must not contain duplicates`);
    }
  });
}

async function main() {
  let schema;

  try {
    schema = JSON.parse(await readFile(schemaPath, "utf8"));
  } catch (error) {
    fail(`schema/degree.schema.json: invalid JSON: ${error.message}`);
  }

  if (!schema) return finish();

  const entries = await readdir(degreesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".degree.md")) {
      fail(`degrees/${entry.name}: legacy flat degree files are not supported; use degrees/<id>/DEGREE.md`);
    }
  }

  const degreePackages = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (degreePackages.length === 0) {
    fail("degrees/: no degree packages found; expected degrees/<id>/DEGREE.md");
  }

  const seenIds = new Set();

  for (const packageName of degreePackages) {
    const packagePath = path.join("degrees", packageName);
    const filePath = path.join(packagePath, "DEGREE.md");
    const absolutePath = path.join(degreesDir, packageName, "DEGREE.md");
    let source;

    try {
      source = await readFile(absolutePath, "utf8");
    } catch (error) {
      fail(`${packagePath}: missing DEGREE.md entrypoint`);
      continue;
    }

    const parts = splitDegreeFile(source, filePath);
    if (!parts) continue;

    const data = parseFrontmatterYaml(parts.frontmatter, filePath);
    if (data.id !== packageName) {
      fail(`${filePath}: frontmatter id must match package folder name ${packageName}`);
    }
    validateDegree(data, filePath, schema, seenIds);
  }

  finish(degreePackages.length);
}

function finish(count = 0) {
  if (errors.length > 0) {
    console.error(`Degree validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Degree validation passed (${count} degree packages).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
