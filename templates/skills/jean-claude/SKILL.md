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
- Model-independent: the memory is plain files, so any model reads what
  any other model wrote. Switching models never loses memories; it only
  changes how carefully the rules are followed.

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

## Where to put things (instructions vs memory)

- Firm rules you want enforced every time and controlled by you:
  `AGENTS.md` (project) — e.g. "never commit to main". The harness
  injects it free into every session.
- Preferences and discoveries that emerge while working: Jean Claude's
  memory — e.g. a correction, a decision, a project quirk. The agent
  curates it; the user just says "remember X".
- Never duplicate: a rule living in both places rots. If it is already
  an instruction, don't memorize it.

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

## Frequently asked questions

Short answers with JC mechanics. Use them when the user asks how memory
behaves — don't recite, adapt to the question.

- **Do you remember things between conversations?** Yes, but only through
  files. Every session starts blank; what I know arrives by reading them.
- **Is everything from an old chat in memory?** No. Only what is durable
  gets saved. If you want something from an old chat remembered, safest is
  to tell me again in the current chat.
- **Can I see everything stored?** Yes. Ask for a listing, the index, or
  any fact file — they're plain Markdown under
  `{absoluteMemRoot}/<slug>/memory/`.
- **Can I change or delete something?** Yes. Tell me what's wrong and I
  edit the fact; to forget, I delete the file plus its index line.
  Deletions are permanent.
- **Do you delete things on your own?** No. Only when you say "forget X"
  or when a fact turns out wrong.
- **Do you save everything I say?** No. Only durable facts — things still
  true months from now. Passing remarks and in-progress task state are
  never saved.
- **Local or cloud?** Local. Plain `.md` files in your home directory, no
  account, no server.
- **Can another project see my memory?** No. One slug per project, strict
  isolation — memories never leak across projects.
- **Can another person see it?** Anyone with access to your disk can read
  the files. Never save secrets: no passwords, keys, or tokens, even if
  asked.
- **What if a stored fact goes stale or contradicts?** Memories reflect
  what was true when written. I verify named files and flags against the
  code before recommending them, update or delete what conflicts, and
  never create duplicates.
- **A preference just for this chat?** Then it isn't saved as a general
  rule. One-off task instructions stay in the conversation.
- **Do you announce when you consult memory?** I read the index first and
  open what's relevant without narrating it. If you ask where something
  came from, I show you the file.

## Go deeper (repo links)

This file covers the 90% case. For depth, fetch from the repo — links are
pinned to this release, so they always match the installed behavior:
- Full example session: https://github.com/martinpercu/opencode-jean-claude/blob/v{version}/comparisons/session-jean-claude.md
- Side-by-side vs standard Build: https://github.com/martinpercu/opencode-jean-claude/blob/v{version}/comparisons/jc-vs-build.md
- Spanish versions: same paths with `.es.md` instead of `.md`.
Use the `webfetch` tool to read them when the question needs more than
this file can answer.
