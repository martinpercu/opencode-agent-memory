#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import * as readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, "../templates");
const PACKAGE_JSON_PATH = path.resolve(__dirname, "../package.json");

const RESERVED_NAMES = new Set([
  "build",
  "plan",
  "general",
  "explore",
  "compaction",
  "title",
  "summary",
]);

const PROFILES = {
  "1": {
    key: "build-like",
    description:
      "Build agent with persistent per-project memory (Smart Memory). Full tool access.",
    permissionBlock:
      "permission:\n  edit: allow\n  bash: allow\n  external_directory:\n    \"{absoluteMemRoot}\": allow\n    \"{absoluteMemRoot}/**\": allow",
  },
  "2": {
    key: "ask-first",
    description:
      "Agent with persistent per-project memory (Smart Memory). Asks before edits and shell commands.",
    permissionBlock:
      "permission:\n  edit: ask\n  bash: ask\n  external_directory:\n    \"{absoluteMemRoot}\": allow\n    \"{absoluteMemRoot}/**\": allow",
  },
  "3": {
    key: "plan-like",
    description:
      "Read-only planning agent with persistent per-project memory (Smart Memory).",
    permissionBlock:
      "permission:\n  edit: deny\n  bash: ask\n  external_directory:\n    \"{absoluteMemRoot}\": allow\n    \"{absoluteMemRoot}/**\": allow",
  },
};

function getVersion() {
  try {
    const raw = fs.readFileSync(PACKAGE_JSON_PATH, "utf8");
    const pkg = JSON.parse(raw);
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function printUsage() {
  console.log(`smart-memory — Persistent per-project memory agent for opencode.

Usage:
  smart-memory init              Install the Smart Memory agent + memory dirs
  smart-memory --help            Show this help
  smart-memory --version         Show version

Examples:
  smart-memory init
  npx github:martinpercu/opencode-agent-memory init`);
}

function hasOpencodeInPath() {
  const pathEnv = process.env.PATH || "";
  const dirs = pathEnv.split(path.delimiter);
  for (const dir of dirs) {
    if (!dir) continue;
    try {
      const candidate = path.join(dir, "opencode");
      fs.accessSync(candidate, fs.constants.X_OK);
      return true;
    } catch {
      // ignore, keep scanning
    }
  }
  return false;
}

function computeSlug(cwd) {
  let abs = path.resolve(cwd);
  // quitar trailing slash (salvo raíz "/")
  if (abs.length > 1 && abs.endsWith(path.sep)) {
    abs = abs.slice(0, -1);
  }
  return abs.replace(/\//g, "-");
}

function parseYesNo(input, def = false) {
  const t = input.trim().toLowerCase();
  if (t === "") return def;
  if (["y", "yes"].includes(t)) return true;
  if (["n", "no"].includes(t)) return false;
  return null;
}

// Prompter: readline interactivo con TTY; lectura bulk si stdin viene
// pipeado. (readline/promises .question() se cuelga desde la 2ª pregunta
// con stdin no-TTY: el stream pipeado no re-emite líneas por pregunta.)
function createPrompter() {
  if (process.stdin.isTTY) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return {
      ask: async (prompt) => {
        try {
          return await rl.question(prompt);
        } catch {
          // Ctrl+C durante preguntas → salir limpio con 130
          console.log("");
          process.exit(130);
        }
      },
      close: () => rl.close(),
    };
  }
  let lines = [];
  try {
    lines = fs.readFileSync(0, "utf8").split(/\r?\n/);
  } catch {
    lines = [];
  }
  let i = 0;
  return {
    ask: async (prompt) => {
      process.stdout.write(prompt);
      const line = i < lines.length ? lines[i++] : "";
      process.stdout.write(line + "\n");
      return line;
    },
    close: () => {},
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printUsage();
    process.exit(0);
  }
  if (args[0] === "--version") {
    console.log(getVersion());
    process.exit(0);
  }
  if (args[0] !== "init") {
    console.error(`Error: unknown command "${args[0]}"`);
    printUsage();
    process.exit(1);
  }

  try {
    await runInit();
  } catch (err) {
    console.error(`Error: ${err?.message || err}`);
    process.exit(1);
  }
}

async function runInit() {
  const HOME = os.homedir();
  const CWD = process.cwd();
  const MEMROOT = path.join(HOME, ".opencode-memory");
  const slug = computeSlug(CWD);
  const PROJDIR = path.join(MEMROOT, slug);
  const INDEX = path.join(PROJDIR, "MEMORY.md");
  const MEMDIR = path.join(PROJDIR, "memory");
  const MASTER = path.join(MEMROOT, "instructions.md");

  // paso 0: detección previa (no bloqueante)
  let opencodeEvidence = false;
  try {
    if (fs.existsSync(path.join(HOME, ".config", "opencode"))) {
      opencodeEvidence = true;
    }
  } catch {
    // tolerar fallo
  }
  if (!opencodeEvidence) {
    try {
      if (hasOpencodeInPath()) opencodeEvidence = true;
    } catch {
      // tolerar fallo
    }
  }
  if (!opencodeEvidence) {
    console.log("Warning: opencode not detected, installing anyway");
  }

  const prompter = createPrompter();
  const ask = (prompt) => prompter.ask(prompt);
  process.on("SIGINT", () => {
    console.log("");
    process.exit(130);
  });

  // paso 1: preguntas
  let agentName = "";
  while (true) {
    const raw = await ask("Agent name [smart-memory]: ");
    const name = (raw || "").trim() === "" ? "smart-memory" : raw.trim();
    if (name === "") {
      console.log("Name cannot be empty.");
      continue;
    }
    if (!/^[a-z0-9-]+$/.test(name)) {
      console.log("Invalid name. Use only [a-z0-9-].");
      continue;
    }
    if (RESERVED_NAMES.has(name)) {
      console.log("that name is reserved by opencode");
      continue;
    }
    agentName = name;
    break;
  }

  let profile = null;
  while (true) {
    console.log("Permission profile:");
    console.log(
      "1) build-like  — full access, no prompts (edit: allow, bash: allow)"
    );
    console.log(
      "2) ask-first   — asks before edits and shell (edit: ask, bash: ask)"
    );
    console.log(
      "3) plan-like   — read-only, cannot edit (edit: deny, bash: ask)"
    );
    const raw = await ask("Choose [1]: ");
    const choice = (raw || "").trim() === "" ? "1" : raw.trim();
    if (PROFILES[choice]) {
      profile = PROFILES[choice];
      break;
    }
    console.log("Invalid choice. Enter 1, 2 or 3.");
  }

  let scope = "global";
  while (true) {
    console.log("Install agent for:");
    console.log(
      "1) global (~/.config/opencode/agents/) — all your projects (recommended)"
    );
    console.log("2) this project (.opencode/agents/)    — only this repo");
    const raw = await ask("Choose [1]: ");
    const choice = (raw || "").trim() === "" ? "1" : raw.trim();
    if (choice === "1") {
      scope = "global";
      break;
    }
    if (choice === "2") {
      scope = "project";
      break;
    }
    console.log("Invalid choice. Enter 1 or 2.");
  }

  let setDefault = false;
  while (true) {
    const raw = await ask(
      "Set as default_agent in opencode.json? (y/N): "
    );
    const parsed = parseYesNo(raw ?? "", false);
    if (parsed === null) {
      console.log('Please answer y or N.');
      continue;
    }
    setDefault = parsed;
    break;
  }

  let AGENTFILE;
  if (scope === "global") {
    AGENTFILE = path.join(HOME, ".config", "opencode", "agents", `${agentName}.md`);
  } else {
    AGENTFILE = path.join(CWD, ".opencode", "agents", `${agentName}.md`);
  }

  const created = [];
  const skipped = [];
  const failed = [];

  const trackWrite = (p, content) => {
    try {
      fs.writeFileSync(p, content, "utf8");
      created.push(p);
    } catch (err) {
      failed.push(p);
      throw err;
    }
  };

  try {
    // paso 2.1: mkdir -p
    for (const dir of [MEMROOT, PROJDIR, MEMDIR, path.dirname(AGENTFILE)]) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        failed.push(dir + " (mkdir)");
        throw err;
      }
    }

    // paso 2.2: MASTER verbatim
    const masterTemplate = fs.readFileSync(
      path.join(TEMPLATES_DIR, "instructions.md"),
      "utf8"
    );
    if (fs.existsSync(MASTER)) {
      const raw = await ask(
        "instructions.md already exists. Overwrite? (y/N): "
      );
      const parsed = parseYesNo(raw ?? "", false);
      if (parsed === true) {
        trackWrite(MASTER, masterTemplate);
      } else {
        skipped.push(MASTER);
        console.log("Keeping existing instructions.md.");
      }
    } else {
      trackWrite(MASTER, masterTemplate);
    }

    // paso 2.3: INDEX — nunca tocar si existe
    if (fs.existsSync(INDEX)) {
      skipped.push(INDEX);
      console.log("Memory index already exists, keeping it.");
    } else {
      trackWrite(INDEX, "# Memory Index\n\n");
    }

    // paso 2.4: render AGENTFILE
    const agentTemplate = fs.readFileSync(
      path.join(TEMPLATES_DIR, "agent.md"),
      "utf8"
    );
    const memoryInstructions = masterTemplate.split("{absoluteMemRoot}").join(MEMROOT);
    let rendered = agentTemplate;
    rendered = rendered.split("{profileDescription}").join(profile.description);
    rendered = rendered
      .split("{permissionBlock}")
      .join(profile.permissionBlock.split("{absoluteMemRoot}").join(MEMROOT));
    rendered = rendered.split("{memoryInstructions}").join(memoryInstructions);
    rendered = rendered.split("{agentName}").join(agentName);
    // {absoluteMemRoot} residual (si el template lo trajera): interpolar también
    rendered = rendered.split("{absoluteMemRoot}").join(MEMROOT);

    if (fs.existsSync(AGENTFILE)) {
      const raw = await ask(
        "Agent file already exists. Overwrite? (y/N): "
      );
      const parsed = parseYesNo(raw ?? "", false);
      if (parsed === true) {
        trackWrite(AGENTFILE, rendered);
      } else {
        skipped.push(AGENTFILE);
        console.log("Keeping existing agent file.");
      }
    } else {
      trackWrite(AGENTFILE, rendered);
    }

    // paso 2.5: default_agent
    if (setDefault) {
      const target =
        scope === "project"
          ? path.join(CWD, "opencode.json")
          : path.join(HOME, ".config", "opencode", "opencode.json");
      try {
        fs.mkdirSync(path.dirname(target), { recursive: true });
      } catch {
        // si no se puede crear el dir, se reporta abajo
      }
      if (!fs.existsSync(target)) {
        const content =
          JSON.stringify(
            {
              $schema: "https://opencode.ai/config.json",
              default_agent: agentName,
            },
            null,
            2
          ) + "\n";
        trackWrite(target, content);
      } else {
        let rawJson;
        try {
          rawJson = fs.readFileSync(target, "utf8");
        } catch (err) {
          failed.push(target);
          throw err;
        }
        let obj;
        try {
          obj = JSON.parse(rawJson);
        } catch {
          console.log(
            `Could not safely edit ${target} (not strict JSON). Add manually: "default_agent": "${agentName}"`
          );
          skipped.push(target);
          obj = null;
        }
        if (obj !== null && typeof obj === "object") {
          obj.default_agent = agentName;
          trackWrite(target, JSON.stringify(obj, null, 2) + "\n");
        }
      }
    }

    prompter.close();

    // paso 2.6: resumen final (formato §1) + recordatorio
    const scopeLabel = scope === "global" ? "global" : "project";
    console.log("✓ Smart Memory installed.");
    console.log(`  Agent: ${agentName} (${scopeLabel} scope, ${profile.key} permissions)`);
    console.log(`  Memory dir: ${PROJDIR}/`);
    console.log(`  Restart opencode, then press Tab and select "${agentName}".`);
    console.log("  build and plan agents were NOT modified.");
    console.log("Restart opencode for changes to take effect.");
  } catch (err) {
    try {
      prompter.close();
    } catch {
      // ignore
    }
    console.error(`Error: ${err?.message || err}`);
    if (created.length > 0) {
      console.error("Created:");
      for (const p of created) console.error(`  + ${p}`);
    }
    if (skipped.length > 0) {
      console.error("Skipped:");
      for (const p of skipped) console.error(`  - ${p}`);
    }
    if (failed.length > 0) {
      console.error("Failed:");
      for (const p of failed) console.error(`  ! ${p}`);
    } else {
      console.error("Failed to complete installation.");
    }
    process.exit(1);
  }
}

await main();
