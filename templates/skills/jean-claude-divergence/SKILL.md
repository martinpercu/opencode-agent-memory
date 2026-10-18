---
name: jean-claude-divergence
description: Resolves memory divergence between Jean Claude and Claude Code for the current project. Load when the memory rules say both sides hold real entries, or when the user asks what differs between their Claude Code and Jean Claude memories.
---

# Memory divergence: Jean Claude vs Claude Code

Both sides hold real memories for this project and they were created
independently. Nothing merges, copies, or deletes until the user decides.
Your job: show, ask, then execute exactly one option.

## 1. Show both sides first

- `read` the Jean Claude index `{absoluteMemRoot}/<slug>/memory/MEMORY.md`
  and open the fact files needed to summarize it faithfully.
- `bash: ls "{claudeProjectsDir}/<slug>/memory"` (+ `read` its `MEMORY.md`
  and the fact files needed to summarize that side too).
- Present both inventories to the user in plain language, with counts:
  what each side remembers. Never claim one side is "newer" or "better"
  unless file dates prove it — report only what you verified.

## 2. Ask with the `question` tool

Options — all JC-side. `{claudeProjectsDir}` is NEVER written to:

- **Keep separate** — each side keeps living its own life; Jean Claude
  ignores Claude Code from now on for this project.
- **Import and unify into Jean Claude** — read both sides fully, dedupe,
  write the merged set into `{absoluteMemRoot}/<slug>/memory/` (new facts +
  updated index). Report what each side contributed.
- **Discard Jean Claude's side and re-inherit from Claude Code** — delete
  JC's facts + index entries, then copy CC's files over (same procedure as
  first-time inherit). DESTRUCTIVE on the JC side: confirm explicitly
  through the `question` tool before touching anything.

If the user asks to write or "sync back" into Claude Code: refuse that
direction plainly (one sentence, no lecture) and re-offer the three
JC-side options. The `~/.claude` tree is read-only, no exceptions.

## 3. Execute exactly the chosen option

- Confirm again before any delete or overwrite on the JC side.
- After unifying or re-inheriting, `read` the resulting index back and
  report the final fact count.
- Never leave the memory half-merged: finish the option completely, or
  roll the JC side back to how it was.
