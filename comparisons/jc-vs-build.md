<p align="right">🇪🇸 <a href="jc-vs-build.es.md">Leer en español</a></p>

# Jean Claude vs Build — same session, side by side

> **Illustrated reconstruction, not a transcript.** The mechanics — what each
> model receives, which rule fires, which files change — follow the real
> prompts line by line. The dialogue is illustrative. Token counts are
> measured from the actual prompt files (`wc -c` ÷ 4), not estimated. Full
> unabridged versions: [Jean Claude](session-jean-claude.md) ·
> [Build](session-build.md).

**Scenario:** Node project at `/Users/martin/demo-shop` → slug `-Users-martin-demo-shop`.
Project memory at start: **empty**.

## t=0 — what each model receives when the session opens

| Layer | 🥋 Jean Claude | 🔧 Standard Build |
|---|---|---|
| Harness (same for both) | ~24k tokens: env, tools, skills, AGENTS.md | ~24k tokens: env, tools, skills, AGENTS.md |
| Agent prompt | ~1.7k: memory rules + Doing tasks + Git and GitHub + Tool discipline | ~6.2k: full default prompt (tone, 11 tool docs, git) |
| Injected memories | **0** — the index must be `read` on demand | **0** — nowhere to read from |
| **t=0 total** | **≈ 25.7k tokens** | **≈ 30k tokens** |

> **Fairness note.** This compares JC against stock Build with no hand-written
> workarounds. A diligent user can maintain `AGENTS.md` by hand and get
> cross-session persistence without JC. The differentiator isn't memory vs
> amnesia — it's **who curates**: you, by hand, in one doc vs the agent
> alone, per fact, with an index, types, and staleness checks.

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

## Turn 2 — "add email validation to the signup and commit" (same session) — **a tie**

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Receives** | msg + live context (index already read in turn 1) → *Doing tasks* | msg + live context — the Spanish preference was stated two turns ago and is fresh for both → base *Doing tasks* |
| **Does** | search → implement → tests (no assuming runner) → `git status/diff/log` → stage signup only → commit | mechanically identical — Build's prompt covers all of it |
| **Commit msg** | `feat(auth): validar email en signup` — Spanish. Both apply it: the preference is live context, no file needed. | `feat(auth): validar email en signup` — Spanish, same reason |
| **Files after** | no memory change (commit lives in git history) | no change |

> **Difference: none.** Within a session, Build is JC's equal. JC's edge isn't applying the preference now — it's still having it in a month. The payoff is turn 3, not this one.

---

## Turn 3 — NEW SESSION: "what commit standard do we use?" — **the decisive moment**

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

> **Two stores, one hierarchy.** `AGENTS.md` is the user's handbook (hand-written, versioned in git, injected every t=0); the project memory is the agent's diary (agent-curated, outside the repo). On conflict the handbook wins — memory is background data, not instructions. The duplication is deliberate: different owners, different jobs. Behaviorally identical here: this rule isn't memory, it's the base prompt JC inherited.

---

## Turn 5 — NEW SESSION: "forget the Spanish commit standard"

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Receives** | fresh t=0 → `read` index → `read` fact → **deletes file + index line** | n/a — nothing was ever stored |
| **Replies** | "Removed: no commit standard stored anymore." | (same question as turn 3 → "no record") |
| **Verifiable** | `ls` the memory dir: one file fewer | — |

> **Difference:** JC's forgetting is a deleted file (checkable on disk); Build's "forgetting" is automatic — it never remembered.

---

## Balance — including JC's costs

| Moment | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| t=0 | ~25.7k, rules but 0 injected memories | ~30k, 0 memory references |
| "remember X" | 3–4 tool calls, typed fact + index line | conversational promise, 0 files |
| Live preference, same session | **tie** — both apply it from context | **tie** |
| New session + past question | `read` index → `read` fact → exact answer | "I don't have that recorded" |
| "forget X" | deletes file + line (`ls`-verifiable) | nothing to delete |
| AGENTS.md trick | same + typed memory copy | same |
| Recall miss (no index line matches) | "no record" — same as Build | "no record", always |
| Cost of saving | 3–4 tool calls + tokens, once per fact | 0 (nothing is saved) |
| Cost of recall | ~2 reads per relevant session (latency + tokens); the index grows with every memory | 0 |
| Stale facts | possible; mitigated by verify-before-recommend, not eliminated | n/a |

Recall is useful but not infallible — that's the README's own warning, and the honest version of this table: when relevance matching fails, JC answers exactly like Build.

**In one line:** both execute equally well *inside* a session; the whole
difference lives at the edges — what enters context at t=0 (nothing in both,
but JC knows where to look) and what survives closing the session (nothing in
Build, files in JC).

Deep dives: [full Jean Claude session](session-jean-claude.md) · [full Build session](session-build.md) · ← [README](../README.md)
