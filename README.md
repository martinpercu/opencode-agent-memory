# Jean Claude

```text
     _                   ____  _                 _         _ 
    | | ___  __ _ _ __  / ___|| | __ _ _   _  __| | ___   | |
 _  | |/ _ \/ _` | '_ \| |    | |/ _` | | | |/ _` |/ _ \  | |
| |_| |  __/ (_| | | | | |___ | | (_| | |_| | (_| |  __/  |_|
 \___/ \___|\__,_|_| |_|\____||_|\__,_|\__,_|\__,_|\___   (_)
```

**Roundhouse kick your agent's amnesia.**

 _                   ____  _                 _         _ 
    | | ___  __ _ _ __  / ___|| | __ _ _   _  __| | ___   | |
 _  | |/ _ \/ _` | '_ \| |    | |/ _` | | | |/ _` |/ _ \  | |
| |_| |  __/ (_| | | | | |___ | | (_| | |_| | (_| |  __/  |_|
 \___/ \___|\__,_|_| |_|\____||_|\__,_|\__,_|\__,_|\___   (_)

*Split-legged context retention for OpenCode.*

> "El agente de OpenCode que nunca olvida dónde dejó los bugs."

Jean Claude is a persistent per-project memory agent for
[opencode](https://opencode.ai), Claude Code style. 100% prompt + files, zero
runtime dependencies.

Tell him `remember X` once; he writes one file per fact plus a one-line index
entry, and reads them back in later sessions — per project, automatically.

## Install

```bash
npx github:martinpercu/opencode-claude-memory init
```

Requirements: Node.js >= 18, opencode installed.

The CLI shows what it will install, asks one question (permission profile),
and does the rest automatically: agent `jean-claude`, global scope, sets it
as `default_agent`, and refreshes the memory master. Restart opencode
afterwards (config loads at startup, no hot-reload).

## What init creates

```
~/.opencode-memory/
  instructions.md            # master copy of the memory prompt (source for future updates)
  -Users-you-myproject/      # slug of the project you ran init in (path with / -> -)
    MEMORY.md                # index: one line per memory, never memory content
    memory/                  # one file per fact, with frontmatter

~/.config/opencode/agents/jean-claude.md      # the agent (always global)
~/.config/opencode/commands/jean-claude-uninstall.md  # /jean-claude-uninstall inside opencode
```

`build` and `plan` agents are NOT modified (verified: their resolved configs
are identical with and without this agent installed).

## Usage

```text
Tab → jean-claude
> remember that tests run with pytest -x
# (writes memory/run-tests-pytest-x.md + one line in MEMORY.md)

> how do we run the tests?
# (reads MEMORY.md, then the file, and answers)

> forget about the pytest thing
# (deletes the file and its index entry)
```

One global install works in every project: Jean Claude derives the slug from
the working directory each session and auto-creates that project's memory
folder on first use. Memories from project A are never visible in project B.

## How it works

100% prompt + files, zero code at runtime, zero plugin in v1:

- The agent file's body is the memory prompt: where memory lives
  (`~/.opencode-memory/<slug>/`), the one-fact-per-file format with
  `name/description/metadata.type` frontmatter, `[[links]]` between memories,
  a lazy index (`MEMORY.md`, one line per memory, read first, file content on
  demand), and when to read/write/forget — including verifying files still
  exist before recommending them (stale-check).
- The harness only guarantees folders exist; all behavior comes from the text.
  Structure mirrors Claude Code's project memory.
- The installer grants the agent `external_directory: allow` scoped to
  `~/.opencode-memory` only, so memory access never prompts. Everything else
  outside the working directory keeps opencode's default (`ask`).

## Configuration

- **Permission profiles** (chosen at init): `build-like` (edit/bash allow),
  `ask-first` (edit/bash ask), `plan-like` (read-only: edit deny, bash ask).
- **Scope:** always global (`~/.config/opencode/agents/`) — one install serves
  all projects.
- **`default_agent`:** opt-in at init; edits `opencode.json` only if it parses
  as strict JSON, otherwise prints the line to add manually.
- Verify after install: `opencode debug agent jean-claude` shows the rendered
  prompt and the profile's permissions.

## Known limitations (v1)

- Per-project memory only. No cross-project personal memory (planned for v2).
- No automatic updater: re-run `init` and confirm overwrites to refresh the
  agent text (your `MEMORY.md` and `memory/*.md` are never touched).
- No plugin: the index is not injected at session start — the agent reads it
  with `read` when a task calls for it.
- Old tool outputs can be compacted away over very long sessions; the prompt
  itself is re-rendered every request and survives compaction.
- Portability across models is by design (pure prompt) and verified end to
  end: a fact written by one model (local Qwen) was correctly recalled by a
  different model (Muse Spark) in a new session.

## Uninstall

From anywhere:

```bash
jean-claude uninstall
```

It finds the agent and the `/jean-claude-uninstall` command in both scopes,
asks before deleting, and asks whether to also delete the memory data in
`~/.opencode-memory` (default: keep it, so reinstalling reuses your memories).
Also cleans `default_agent` from `opencode.json` if it points at the agent.
Restart opencode afterwards. Inside opencode you can also run
`/jean-claude-uninstall`.

Manual fallback (no CLI at hand):

```bash
rm ~/.config/opencode/agents/jean-claude.md  # or .opencode/agents/jean-claude.md
rm -rf ~/.opencode-memory                    # only if you also want the data gone
```

opencode is left exactly as it was.

## Roadmap (v2)

npm publish, dual personal memory, `update` command, real plugin
(`experimental.chat.system.transform` to inject the index at t=0,
`experimental.session.compacting` to shield memory reads from compaction).

## Credits

Structure inspired by Claude Code (Anthropic); behavior researched from its
leaked system prompt and re-implemented for opencode's agent format.
Zero dependencies, MIT licensed.
