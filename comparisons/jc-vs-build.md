🌐 [Leer en español](jc-vs-build.es.md)

# Jean Claude vs Build — same session, side by side

> One scenario, one user, five turns. Each turn shows **what each model receives**,
> what it does, and what it replies. Full unabridged versions:
> [Jean Claude](session-jean-claude.md) · [Build](session-build.md).

**Scenario:** Node project at `/Users/martin/demo-shop` → slug `-Users-martin-demo-shop`.
Project memory at start: **empty**.

## t=0 — what each model receives when the session opens

| Layer | 🥋 Jean Claude | 🔧 Standard Build |
|---|---|---|
| Harness (same for both) | ~24k tokens: env, tools, skills, AGENTS.md | ~24k tokens: env, tools, skills, AGENTS.md |
| Agent prompt | ~1.7k: memory rules + Doing tasks + Git and GitHub + Tool discipline | ~6.2k: full default prompt (tone, 11 tool docs, git) |
| Injected memories | **0** — the index must be `read` on demand | **0** — nowhere to read from |
| **t=0 total** | **≈ 25.7k tokens** | **≈ 30k tokens** |

---

## Turn 1 — "remember that commits are in Spanish, short, with scope"

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Receives** | msg + t=0 → *When to write* fires → checks index → missing → bootstrap (`mkdir` + seed `MEMORY.md`) | msg + t=0 → **nothing fires**: no save rule, no index, no silent permission |
| **Tools** | `bash`, `write` ×2, `edit` | none |
| **Files after** | `MEMORY.md` + `commit-messages-es.md` (`type: feedback` + `Why`/`How to apply`) | zero files anywhere |
| **Replies** | "Noted: commits in Spanish, short, with scope." | "Noted! Commits in Spanish…" (same words, **no persistence**) |

> **Difference:** JC turns the sentence into a typed fact on disk; Build turns it into chat context that dies with the session.

---

## Turn 2 — "add email validation to the signup and commit" (same session)

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Receives** | msg + live context (index already read in turn 1) → *Doing tasks* | msg + live context (preference floating in chat) → base Doing tasks |
| **Does** | search → implement → tests + lint (no assuming runner) → `git status/diff/log` → stage signup only → commit | mechanically identical — Build's prompt covers all of it |
| **Commit msg** | `feat(auth): validar email en signup` — **Spanish via `feedback` memory** | `feat(auth): add email validation` — **English** (preference was chat text, diluted) |
| **Files after** | no memory change (commit lives in git history) | no change |

> **Difference:** guarantee vs. luck. JC applies the preference via typed rule; Build may or may not — nothing told it "remember" was permanent.

---

## Turn 3 — NEW SESSION: "what commit standard do we use?"

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Receives** | fresh t=0 only (**no memories**) → *When to read* → `read` index → line matches → `read` fact → **content enters context NOW** | fresh t=0 only → **no index, no fact, no rule** → finds nothing |
| **Replies** | "Spanish, short, with scope: `feat(auth): …`" | "I don't have that recorded — I don't retain memory between sessions." |

> **Difference:** same "empty" t=0, opposite outcome. JC knows where to look; Build has nowhere to look.

---

## Turn 4 — "how do I run the tests?" (same session)

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Receives** | msg + context → *Doing tasks*: never assume → search → no script → **ask** | identical rule → **ask** |
| **Flow** | user: `npm run test:unit` → run → green → **suggest AGENTS.md** → user adds "save to project memory too" → `edit` AGENTS.md + `write` `test-command.md` (`type: project`) + index line | user: `npm run test:unit` → run → green → **suggest AGENTS.md** → saved there, end of story |
| **Survives via** | AGENTS.md (free at every future t=0) **+** typed `project` memory | AGENTS.md only — shared cache, both agents get it |

> **Difference:** none in behavior, one in bookkeeping. This rule isn't memory — it's the base prompt JC inherited.

---

## Turn 5 — NEW SESSION: "forget the Spanish commit standard"

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Receives** | fresh t=0 → `read` index → `read` fact → **deletes file + index line** | n/a — nothing was ever stored |
| **Replies** | "Removed: no commit standard stored anymore." | (same question as turn 3 → "no record") |
| **Verifiable** | `ls` the memory dir: one file fewer | — |

> **Difference:** JC's forgetting is a deleted file (checkable on disk); Build's "forgetting" is automatic — it never remembered.

---

## Balance

| Moment | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| t=0 | ~25.7k, rules but 0 injected memories | ~30k, 0 memory references |
| "remember X" | 3–4 tool calls, typed fact + index line | conversational promise, 0 files |
| Old preference, same session | typed `feedback` rule (guarantee) | chat context (luck) |
| New session + past question | `read` → `read` → exact answer | "I don't have that recorded" |
| "forget X" | deletes file + line (`ls`-verifiable) | nothing to delete |
| AGENTS.md trick | same + typed memory copy | same |

**In one line:** both execute equally well *inside* a session; the whole difference
lives at the edges — what enters context at t=0 (nothing in both, but JC knows
where to look) and what survives closing the session (nothing in Build, files in JC).

Deep dives: [full Jean Claude session](session-jean-claude.md) · [full Build session](session-build.md) · ← [README](../README.md)
