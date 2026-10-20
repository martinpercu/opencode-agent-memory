---
name: jean-claude
description: About the Jean Claude agent itself — install layout, memory locations, Claude Code import, uninstall, troubleshooting. Load when the user asks how Jean Claude works, where memories live, about install/import/uninstall, or when memory behaves unexpectedly.
---

# Jean Claude — operator manual

Facts about the Jean Claude agent itself. Use them when the user asks how
Jean Claude works, where things live, or when memory behaves unexpectedly.
This file is static text — the filesystem is the truth: verify dynamic
claims (what exists, what was imported) by listing the directories.

## What Jean Claude is

- An OpenCode primary agent with a memory protocol ported from Claude
  Code's file-based memory: one fact per file, frontmatter
  (`name/description/metadata type`), `[[links]]`, and a `MEMORY.md` index
  of one-line pointers. The full protocol lives in the agent's system
  prompt, not here.
- No background services, no database: plain Markdown files under
  `{absoluteMemRoot}/` plus OpenCode's file tools.

## Install layout (created by `jean-claude init`)

- Agent: `~/.config/opencode/agents/jean-claude.md`
- Skills: `~/.config/opencode/skills/jean-claude/` (this file) and
  `~/.config/opencode/skills/jean-claude-divergence/`
- `default_agent: jean-claude` in `~/.config/opencode/opencode.json`
- Data: `{absoluteMemRoot}/` (`~/.opencode-memory`),
  `<slug>/memory/MEMORY.md` index + one file per fact. Slug = working
  directory with `/` replaced by `-`.

## Memory locations

- Jean Claude's: `{absoluteMemRoot}/<slug>/memory/` — read and written
  during sessions.
- Claude Code's (read-only): `{claudeProjectsDir}/<slug>/memory/` —
  never written, moved, or deleted, no exceptions.
- `init` copies pre-existing Claude Code memories once. Memories a
  project gains in Claude Code later are inherited lazily on first
  Jean Claude use there, if the JC side is still empty. If both sides
  later hold real entries, that is a divergence — follow the
  `jean-claude-divergence` skill.

## Uninstall

- `npx -y github:martinpercu/opencode-jean-claude uninstall`: removes the
  agent, both skills, `{absoluteMemRoot}/`, and the `default_agent` key.
  `~/.claude` is untouched.

## Troubleshooting

- "You don't remember anything": a bare `# Memory Index` with no entries
  means nothing stored yet — normal for a new project.
- "You don't know what Claude Code knew here": if the JC side already
  held entries when CC's appeared, that is divergence (see the
  `jean-claude-divergence` skill). If the JC side was empty, the inherit
  should have run — check `{claudeProjectsDir}/<slug>/memory` exists.
- "Memories from another project leak here": impossible by slug unless
  the working directory changed (watch symlinks like `/private/tmp`,
  which resolve differently) — recompute the slug.
- "Forget X didn't work": the fact file plus its index line must both be
  gone — list the memory dir to confirm.
- Folders like `-Users-<someone-else>-*` in either tree are inert mirrors
  from another machine/user (their paths don't exist here, so no session
  ever reads them). The JC-side copies can be deleted; never touch
  `~/.claude`.
