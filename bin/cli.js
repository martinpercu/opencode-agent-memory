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

const PROFILES = {
  "1": {
    key: "build-like",
    description:
      "Build agent with persistent per-project memory (Jean Claude). Full tool access.",
    permissionBlock:
      "permission:\n  edit: allow\n  bash: allow\n  external_directory:\n    \"{absoluteMemRoot}\": allow\n    \"{absoluteMemRoot}/**\": allow",
  },
  "2": {
    key: "ask-first",
    description:
      "Agent with persistent per-project memory (Jean Claude). Asks before edits and shell commands.",
    permissionBlock:
      "permission:\n  edit: ask\n  bash: ask\n  external_directory:\n    \"{absoluteMemRoot}\": allow\n    \"{absoluteMemRoot}/**\": allow",
  },
  "3": {
    key: "plan-like",
    description:
      "Read-only planning agent with persistent per-project memory (Jean Claude).",
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
  console.log(`jean-claude — Persistent per-project memory agent for opencode.

Usage:
  jean-claude init              Install the Jean Claude agent + memory dirs
  jean-claude uninstall         Remove the agent (optionally its memory data)
  jean-claude --help            Show this help
  jean-claude --version         Show version

Examples:
  jean-claude init
  jean-claude uninstall
  npx github:martinpercu/opencode-claude-memory init`);
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

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function listMemoryEntries(p) {
  try {
    return fs.readdirSync(p).filter((name) => name !== ".DS_Store");
  } catch {
    return [];
  }
}

function scanClaudeProjectMemories(home) {
  const projectsDir = path.join(home, ".claude", "projects");
  const candidates = [];
  let entries = [];
  try {
    entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  } catch {
    return candidates;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const memoryDir = path.join(projectsDir, entry.name, "memory");
    const legacyIndex = path.join(projectsDir, entry.name, "MEMORY.md");
    const hasMemoryFiles = isDir(memoryDir) && listMemoryEntries(memoryDir).length > 0;
    const hasLegacyIndex = isFile(legacyIndex);
    if (hasMemoryFiles || hasLegacyIndex) {
      candidates.push({
        slug: entry.name,
        memoryDir,
        legacyIndex,
        hasMemoryFiles,
        hasLegacyIndex,
      });
    }
  }
  return candidates;
}

function copyMemoryFiles(srcDir, destDir) {
  let count = 0;
  let entries = [];
  try {
    entries = fs.readdirSync(srcDir, { withFileTypes: true });
  } catch {
    return count;
  }
  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      count += copyMemoryFiles(src, dest);
    } else if (entry.isFile()) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
      count += 1;
    }
  }
  return count;
}

// Copia one-shot, solo lectura sobre ~/.claude. Nunca toca CC ni pisa memorias
// de Jean Claude existentes: slug con datos en destino = skip.
function importClaudeCodeMemories(home, memroot) {
  const result = { imported: [], skipped: [], failed: [], files: 0 };
  for (const cand of scanClaudeProjectMemories(home)) {
    const destDir = path.join(memroot, cand.slug, "memory");
    if (listMemoryEntries(destDir).length > 0) {
      result.skipped.push(cand.slug);
      continue;
    }
    try {
      let files = 0;
      if (cand.hasMemoryFiles) {
        files += copyMemoryFiles(cand.memoryDir, destDir);
      }
      const destIndex = path.join(destDir, "MEMORY.md");
      if (!isFile(destIndex) && cand.hasLegacyIndex) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(cand.legacyIndex, destIndex);
        files += 1;
      }
      if (files > 0) {
        result.imported.push({ slug: cand.slug, files });
        result.files += files;
      }
    } catch {
      result.failed.push(cand.slug);
    }
  }
  return result;
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
  if (args[0] === "init") {
    try {
      await runInit();
    } catch (err) {
      console.error(`Error: ${err?.message || err}`);
      process.exit(1);
    }
    return;
  }
  if (args[0] === "uninstall") {
    try {
      await runUninstall();
    } catch (err) {
      console.error(`Error: ${err?.message || err}`);
      process.exit(1);
    }
    return;
  }
  console.error(`Error: unknown command "${args[0]}"`);
  printUsage();
  process.exit(1);
}

async function runInit() {
  const HOME = os.homedir();
  const CWD = process.cwd();
  const MEMROOT = path.join(HOME, ".opencode-memory");
  const slug = computeSlug(CWD);
  const PROJDIR = path.join(MEMROOT, slug);
  const MEMDIR = path.join(PROJDIR, "memory");
  const INDEX = path.join(MEMDIR, "MEMORY.md");
  const MASTER = path.join(MEMROOT, "instructions.md");
  const resolvedCwd = path.resolve(CWD);
  const seedProject =
    resolvedCwd !== path.parse(resolvedCwd).root && resolvedCwd !== path.resolve(HOME);

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

  const claudeCandidates = scanClaudeProjectMemories(HOME);

  console.log(`
     _                     ____  _                 _         _ 
    | | ___  __ _ _ __    / ___|| | __ _ _   _  __| | ___   | |
 _  | |/ _ \\/ _\` | '_ \\  | |    | |/ _\` | | | |/ _\` |/ _ \\  | |
| |_| |  __/ (_| | | | | | |___ | | (_| | |_| | (_| |  __/  |_|
 \\___/ \\___|\\__,_|_| |_|  \\____||_|\\__,_|\\__,_|\\__,_|\\___|  (_)
`);
  console.log("🥋 About to install Jean Claude for OpenCode...");
  console.log("");
  console.log("This will set up:");
  console.log("  • Agent: 'Jean Claude' registered in OpenCode");
  console.log("  • Memory Architecture: Claude Code-style per-project memory (memory/MEMORY.md + fact files)");
  console.log("  • Storage Location: ~/.opencode-memory");
  if (claudeCandidates.length > 0) {
    console.log(
      `  • Claude Code memories found: ${claudeCandidates.length} project(s) — will be copied (read-only; ~/.claude is never modified)`
    );
  }
  console.log("");

  let go = false;
  while (true) {
    const raw = await ask("Ready to roundhouse kick amnesia out of your terminal? [Y/n]: ");
    const parsed = parseYesNo(raw ?? "", true);
    if (parsed === null) {
      console.log("Please answer Y or n.");
      continue;
    }
    go = parsed;
    break;
  }
  if (!go) {
    console.log("Nothing to do.");
    prompter.close();
    return;
  }

  // Todo fijo: agent jean-claude, perfil build-like, scope global,
  // default_agent siempre, master siempre.
  const agentName = "jean-claude";
  const scope = "global";
  const profile = PROFILES["1"];

  let AGENTFILE;
  let CMDFILE;
  AGENTFILE = path.join(HOME, ".config", "opencode", "agents", `${agentName}.md`);
  CMDFILE = path.join(HOME, ".config", "opencode", "commands", "jean-claude-uninstall.md");

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
    const dirsToCreate = [MEMROOT, path.dirname(AGENTFILE), path.dirname(CMDFILE)];
    if (seedProject) dirsToCreate.push(PROJDIR, MEMDIR);
    for (const dir of dirsToCreate) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        failed.push(dir + " (mkdir)");
        throw err;
      }
    }

    // paso 2.1b: import de memorias de Claude Code (solo lectura sobre ~/.claude)
    const importResult = importClaudeCodeMemories(HOME, MEMROOT);

    // paso 2.2: MASTER verbatim, siempre se pisa (es nuestro, no datos)
    const masterTemplate = fs.readFileSync(
      path.join(TEMPLATES_DIR, "instructions.md"),
      "utf8"
    );
    trackWrite(MASTER, masterTemplate);

    // paso 2.3: INDEX — nunca tocar si existe
    if (!seedProject) {
      console.log(
        "Installed from root/home directory: skipping project seed (memory folders are created per project on first use)."
      );
    } else if (fs.existsSync(INDEX)) {
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

    // agent y command son nuestros: se pisan sin preguntar
    trackWrite(AGENTFILE, rendered);

    // paso 2.4b: command file (uninstall from inside opencode)
    const cmdTemplate = fs.readFileSync(
      path.join(TEMPLATES_DIR, "command.md"),
      "utf8"
    );
    trackWrite(CMDFILE, cmdTemplate);

    // paso 2.5: default_agent, siempre (global)
    {
      const target = path.join(HOME, ".config", "opencode", "opencode.json");
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

    console.log("✓ Jean Claude installed.");
    console.log(`  Restart opencode to select "Jean Claude".`);
    if (importResult.imported.length > 0) {
      console.log("  Imported Claude Code memories:");
      for (const item of importResult.imported) {
        console.log(`    + ${item.slug} (${item.files} file${item.files === 1 ? "" : "s"})`);
      }
      console.log("  ~/.claude was not modified.");
    }
    if (importResult.skipped.length > 0) {
      console.log("  Claude Code projects already covered by Jean Claude memories (kept as-is):");
      for (const slug of importResult.skipped) console.log(`    - ${slug}`);
    }
    if (importResult.failed.length > 0) {
      console.log("  Claude Code projects that could not be imported:");
      for (const slug of importResult.failed) console.log(`    ! ${slug}`);
    }
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

async function runUninstall() {
  const HOME = os.homedir();
  const CWD = process.cwd();
  const MEMROOT = path.join(HOME, ".opencode-memory");

  const prompter = createPrompter();
  const ask = (prompt) => prompter.ask(prompt);
  process.on("SIGINT", () => {
    console.log("");
    process.exit(130);
  });

  console.log("This uninstaller removes the Jean Claude agent and its memory");
  console.log("from opencode (agent file, uninstall command, memory data, and");
  console.log("the default_agent key if it points at Jean Claude).");
  console.log("");

  const agentName = "jean-claude";

  const agentCandidates = [
    path.join(HOME, ".config", "opencode", "agents", `${agentName}.md`),
    path.join(CWD, ".opencode", "agents", `${agentName}.md`),
  ];
  const cmdCandidates = [
    path.join(HOME, ".config", "opencode", "commands", "jean-claude-uninstall.md"),
    path.join(HOME, ".config", "opencode", "command", "jean-claude-uninstall.md"),
    path.join(CWD, ".opencode", "commands", "jean-claude-uninstall.md"),
    path.join(CWD, ".opencode", "command", "jean-claude-uninstall.md"),
    // legacy names (pre-0.2.0)
    path.join(HOME, ".config", "opencode", "commands", "smart-memory-uninstall.md"),
    path.join(HOME, ".config", "opencode", "command", "smart-memory-uninstall.md"),
    path.join(CWD, ".opencode", "commands", "smart-memory-uninstall.md"),
    path.join(CWD, ".opencode", "command", "smart-memory-uninstall.md"),
  ];
  const found = [...agentCandidates, ...cmdCandidates].filter((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  const removed = [];
  const failed = [];

  const hasData = fs.existsSync(MEMROOT);
  if (found.length === 0 && !hasData) {
    console.log("Jean Claude is not installed. Nothing to do.");
    prompter.close();
    return;
  }

  let yes = false;
  while (true) {
    const raw = await ask("Uninstall Jean Claude? (y/N): ");
    const parsed = parseYesNo(raw ?? "", false);
    if (parsed === null) {
      console.log("Please answer y or N.");
      continue;
    }
    yes = parsed;
    break;
  }
  if (!yes) {
    console.log("Nothing to do.");
    prompter.close();
    return;
  }

  for (const p of found) {
    try {
      fs.unlinkSync(p);
      removed.push(p);
    } catch {
      failed.push(p);
    }
  }

  if (hasData) {
    try {
      fs.rmSync(MEMROOT, { recursive: true, force: true });
      removed.push(MEMROOT);
    } catch {
      failed.push(MEMROOT);
    }
  }

  for (const target of [
    path.join(CWD, "opencode.json"),
    path.join(HOME, ".config", "opencode", "opencode.json"),
  ]) {
    let obj = null;
    try {
      if (!fs.existsSync(target)) continue;
      obj = JSON.parse(fs.readFileSync(target, "utf8"));
    } catch {
      continue;
    }
    if (obj && obj.default_agent === agentName) {
      try {
        delete obj.default_agent;
        fs.writeFileSync(target, JSON.stringify(obj, null, 2) + "\n", "utf8");
        removed.push(`${target} (default_agent key)`);
      } catch {
        failed.push(target);
      }
    }
  }

  prompter.close();

  console.log("✓ Jean Claude uninstalled.");
  if (removed.length > 0) {
    console.log("Removed:");
    for (const p of removed) console.log(`  - ${p}`);
  }
  if (failed.length > 0) {
    console.log("Failed (check permissions):");
    for (const p of failed) console.log(`  ! ${p}`);
    process.exit(1);
  }
  console.log("opencode is now exactly as it was before Jean Claude was installed.");
  console.log("Restart opencode for changes to take effect.");
}

await main();
