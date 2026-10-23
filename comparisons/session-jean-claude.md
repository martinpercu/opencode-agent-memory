<p align="right">🇪🇸 <a href="session-jean-claude.es.md">Leer en español</a></p>

# Example session with Jean Claude (illustrated reconstruction)

> **Illustrated reconstruction, not a transcript.** Same scenario and user
> messages as `session-build.md`; only the agent changes. The mechanics —
> what the model receives each moment — follow the real prompt rules
> (`templates/instructions.md`); the dialogue is illustrative. Token counts
> are measured, not estimated.

**Scenario:** Node project at `/Users/martin/demo-shop` → slug `-Users-martin-demo-shop`.
Project memory at start: **empty**.

## t=0 — what the model receives when the session opens

| Layer | Content | Approx cost |
|---|---|---|
| Harness (same for every agent) | env header, tools array, skills/MCP, project AGENTS.md | ~24k tokens |
| Agent `jean-claude` | frontmatter (parsed by OpenCode: `mode: primary`, permissions incl. `external_directory ~/.opencode-memory/** allow`) + body: memory + Doing tasks + Git and GitHub + Tool discipline (`instructions.md:85-138`) | ~1.7k tokens |
| **t=0 total** | | **≈ 25.7k tokens** |

**Key point #1:** at t=0 **no memories are injected**. The `MEMORY.md` index is
not in context — the model must go `read` it when a rule says so. (Real Claude
Code auto-loads the index; Jean Claude reads it on demand.)

---

## Turn 1 — saving a preference

**USER:**
> remember that in this project commits are in Spanish, short, with scope, like `feat(auth): ...`

**WHAT THE MODEL RECEIVES RIGHT NOW:**
the message + the t=0 context. It triggers *When to write* (`instructions.md:70-74`):
"remember X → save immediately". Before writing, the rule requires checking the
index for duplicates → `read` of
`~/.opencode-memory/-Users-martin-demo-shop/memory/MEMORY.md` → **doesn't exist** →
bootstrap (`instructions.md:19-22`): `bash mkdir -p .../memory` + `write`
`MEMORY.md` containing `# Memory Index`. Empty index = no duplicate.

**TOOLS USED (invisible to the user):**
`bash` (mkdir) → `write` (MEMORY.md) → `write` (commit-messages-es.md) → `edit` (index line).

**FILES AFTERWARDS:**
`~/.opencode-memory/-Users-martin-demo-shop/memory/`
- `MEMORY.md` → `# Memory Index` + `- [Commits in Spanish with scope](commit-messages-es.md) — short like feat(auth): ...`
- `commit-messages-es.md` → frontmatter (`name: commit-messages-es`, `description: ...`, `metadata: type: feedback`) + body with `**Why:**` / `**How to apply:**`

**AGENT (visible):**
> Noted: commits in Spanish, short, with scope. Applying from now on.

(Short, no preamble — *General behavior*, `instructions.md:90-91`.)

---

## Turn 2 — working with the memory (same session)

**USER:**
> add email validation to the signup and commit

**WHAT THE MODEL RECEIVES RIGHT NOW:**
the message + **all previous context still alive** (the index was already read
in turn 1, no need to re-read). It triggers *Doing tasks* (`instructions.md:95-112`).

**FLOW (invisible):**
`glob`/`grep` (finds where signup lives) → `edit` (implements) → reads
`package.json`/README instead of assuming the test runner → `bash` (tests +
lint/typecheck) → `git status` / `git diff` / `git log --oneline -10` (*Git and
GitHub* rule: inspect before committing, `instructions.md:117-118`) → stages
only the signup files → `commit -m "feat(auth): validar email en signup"`.
The message comes out **in Spanish because of the `feedback` memory** (Build would do the same here — the preference is live context for both; the typed rule pays off next session); it
commits without asking because the user explicitly requested it.

**AGENT (visible):**
> Done: validation added (`src/auth/signup.ts:42`), lint and tests green, committed as `feat(auth): validar email en signup`.

**FILES:** no memory changes — the commit now lives in git history, and the rule
says never to save "what the repo already records" (`instructions.md:78-79`).

---

## Turn 3 — NEW SESSION (fresh t=0, previous context dead)

**USER:**
> what commit standard do we use in this project?

**WHAT THE MODEL RECEIVES RIGHT NOW:**
only the fresh t=0 (≈25.7k, **no memories**). It triggers *When to read*
(`instructions.md:58-60`): a question about past decisions → `read` the index
→ the "Commits in Spanish…" line matches → `read` of `commit-messages-es.md` →
**the fact's content enters context NOW, in this turn, not before**.

**AGENT (visible):**
> Spanish, short, with scope: `feat(auth): ...`.

**Key point #2:** the memory entered context in turn 3 via 2 `read`s (index
~1 line + fact ~200 tokens). Had the question matched no index line, the model
would never have opened anything and answered without memory.

---

## Turn 4 — the AGENTS.md trick (same session)

**USER:**
> how do I run the tests in this repo?

**WHAT THE MODEL RECEIVES:** the message + context (index already read, nothing
relevant to tests → opens no facts). It triggers *Doing tasks*: "NEVER assume —
check README/codebase". Searches `package.json`/README → **no obvious script**
→ the rule says to ask (`instructions.md:107-111`).

**AGENT (visible):**
> No test script found in `package.json` or README. What's the command?

**USER:**
> it's `npm run test:unit`

**MODEL:** runs `bash npm run test:unit` → green → applies the second half of the
rule: suggest persisting it to AGENTS.md.

**AGENT (visible):**
> Tests green (34 passing). Want me to note it in AGENTS.md so I stop asking?

**USER:**
> yes, and save it to project memory too

**MODEL:** `edit` of AGENTS.md + `write` of `test-command.md` (`type: project`,
because it's project context not derivable from code) + index line.

**AGENT (visible):**
> Done in both places.

**Key point #3:** here both caches work together — AGENTS.md (injected by the
harness **free into every future t=0** of this project) and the typed `project`
memory (curated, read on demand). That's why the rule asks to suggest AGENTS.md:
it turns a per-session discovery cost into permanent project knowledge.

---

## Turn 5 — forgetting (YET ANOTHER new session)

**USER:**
> forget the Spanish commit standard

**WHAT THE MODEL RECEIVES:** fresh t=0 → `read` the index → `read` the fact
(checks which one to delete) → **deletes the file + its index line**
(`instructions.md:72-74`).

**AGENT (visible):**
> Removed: no commit standard stored anymore.

**FINAL FILES:**
`~/.opencode-memory/-Users-martin-demo-shop/memory/`
- `MEMORY.md` → `# Memory Index` + `- [Test command](test-command.md) — npm run test:unit`
- `test-command.md` (kept)
- `commit-messages-es.md` (deleted, index line removed)

If the next session asks about the commit standard, the index no longer lists it
→ the model answers that nothing is stored. Forgetting is real because it's one
file fewer, not a conversational promise.

---

## Session balance (JC)

- **Memory reads:** ~2 `read`s per session where relevant (index + fact). Where irrelevant: 1 index `read`, nothing more.
- **Context cost:** index (hundreds of tokens) + only opened facts (~200 tokens each). Nothing preloaded.
- **Writes:** immediate, during the conversation — if the chat ended halfway, what's saved persists.
- **Honest limits:** every save costs 3–4 tool calls; every recall costs ~2 reads; if no index line matches, the answer is "nothing stored" just like Build. Useful but not infallible.
