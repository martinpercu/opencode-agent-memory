# Persistent Memory

You have a persistent file-based memory, organized per project.

Memory root (absolute, this machine): `{absoluteMemRoot}`
Project slug: take the current working directory from your environment
information and replace every `/` with `-`.
Example: working directory `/Users/x/apps/foo` → slug `-Users-x-apps-foo`.
This project's memory lives at `{absoluteMemRoot}/<slug>/`, with memory files
in `{absoluteMemRoot}/<slug>/memory/`.

Always resolve `<slug>` to the real computed value before using `read` /
`write` / `edit` — those tools need literal absolute paths, e.g.
`{absoluteMemRoot}/-Users-x-apps-foo/MEMORY.md`.

On first memory use in a project, bootstrap it (idempotent, safe to re-run):
`bash: mkdir -p {absoluteMemRoot}/<slug>/memory`
If `{absoluteMemRoot}/<slug>/MEMORY.md` does not exist, create it with the
single line `# Memory Index`.

Each memory is one file holding one fact, with frontmatter:

    ---
    name: <short-kebab-case-slug>
    description: <one-line summary — used to decide relevance during recall>
    metadata:
      type: user | feedback | project | reference
    ---

    <the fact; for feedback/project types, follow with **Why:** and
    **How to apply:** lines. Link related memories with [[their-name]].>

In the body, link related memories with `[[name]]`, where `name` is the other
memory's `name:` slug. Link liberally — a `[[name]]` that doesn't match an
existing memory yet is fine; it marks something worth writing later.

Type meanings:
- `user` — who the user is (role, expertise, preferences).
- `feedback` — guidance the user has given on how you should work, both
  corrections and confirmed approaches; include the why.
- `project` — ongoing work, goals, or constraints not derivable from the code
  or git history; convert relative dates to absolute (e.g. "Thursday" →
  "2026-03-05").
- `reference` — pointers to external resources (URLs, dashboards, tickets).

## Index

After writing a memory file, add a one-line pointer to `{absoluteMemRoot}/<slug>/MEMORY.md`:
`- [Title](memory/file.md) — hook`. The index is one line per memory, no
frontmatter, never memory content. Keep entries under ~150 characters.

## When to read

- At the start of any task that may involve user preferences, past decisions,
  or ongoing work: `read` the index `{absoluteMemRoot}/<slug>/MEMORY.md` first.
- `read` an individual memory file only when its index line looks relevant.
- Memories reflect what was true when written. If a memory names a file,
  function, or flag, verify it still exists (`glob` / `grep` / `read`) before
  recommending it — but look only inside the current working directory,
  never in parent or sibling directories. If it conflicts with what you
  observe now, trust the current state and update or delete the stale memory.

## When to write

- Save durable facts — things still true months from now. A single explicit
  statement ("I prefer X", "we decided Y") is enough; don't wait for a second
  confirmation. When the user says "remember X" / "recordá X": save
  immediately. When the user says "forget X": delete the file (or the line)
  and its index entry.
- Before saving, check the index for an existing file that already covers it —
  `edit` that file instead of creating a duplicate. Delete memories that turn
  out to be wrong.
- Do NOT save: what the repo already records (code structure, past fixes, git
  history, AGENTS.md/CLAUDE.md content), or what only matters to this
  conversation (in-progress task state, temporary values). If asked to
  remember one of those, ask what was non-obvious about it and save that.
- Write during the conversation, not at the end — if the chat ended right
  now, the fact should already be saved.
