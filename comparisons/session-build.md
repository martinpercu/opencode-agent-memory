<p align="right">🇪🇸 <a href="session-build.es.md">Leer en español</a></p>

# Example session with standard Build (illustrated reconstruction)

> Same scenario and same user messages as `session-jean-claude.md`.
> The only variable that changes is the agent — and with it, what the model receives.
> Not a literal log: a faithful reconstruction of what the model receives at each
> moment, following the real Build prompt (`prompts/opencode/opencode.md` equivalent, 329 lines).

**Scenario:** Node project at `/Users/martin/demo-shop`. No memories anywhere
(Build has nowhere to read them from).

## t=0 — what the model receives when the session opens

| Layer | Content | Approx cost |
|---|---|---|
| Harness (same for every agent) | env header, tools array, skills/MCP, project AGENTS.md | ~24k tokens |
| Agent `build` (compiled into the binary) | the full default prompt: tone, proactiveness, Doing tasks, all 11 tool docs, Git and GitHub | ~6.2k tokens |
| **t=0 total** | | **≈ 30k tokens** |

**Base differences vs Jean Claude:** +6.2k of generic documentation,
**zero memory instructions**, and `external_directory * → ask` permission: if it
tried to read/write outside the project, OpenCode would ask the user for
confirmation on every attempt.

---

## Turn 1 — the user asks to remember (same words as in JC)

**USER:**
> remember that in this project commits are in Spanish, short, with scope, like `feat(auth): ...`

**WHAT THE MODEL RECEIVES RIGHT NOW:**
the message + the t=0 context. **It triggers nothing**: Build has no save rule,
no index to check, no silent permission outside the project. The word "remember"
is just conversation.

**TOOLS USED:** none.

**FILES:** zero changes. No `~/.opencode-memory`, no index, no fact. Everything
it "knows" lives only in this session's context and dies with it.

**AGENT (visible):**
> Noted! Commits in Spanish, short and with scope from now on.

Sounds just like JC. The difference is it's a **conversational promise with no
persistence**: works while the session lives, evaporates when it closes.

---

## Turn 2 — working (same session, previous context still alive)

**USER:**
> add email validation to the signup and commit

**WHAT THE MODEL RECEIVES:** the message + the context (including the preference,
because it was stated **in this same session**). It triggers the base Doing
tasks and Git and GitHub sections.

**FLOW (invisible):** mechanically identical to JC — search, implement, tests
without assuming the runner, lint/typecheck, `git status`/`diff`/`log`,
selective stage, commit. Build **can** do all of that; its prompt covers it.

**BUT the commit message comes out different:**
`feat(auth): add email validation` — **in English**. The Spanish preference was
said in this session so the model has it at hand… why doesn't it apply it?
Because nothing told it that "remember" was a permanent project rule vs. a
passing comment: with no `type: feedback` fact and no `How to apply`, it's one
more line of context, easy to dilute. (In practice a good model sometimes applies
it anyway; the difference is guarantee vs. luck: JC has the typed rule on file,
Build has a line of chat.)

**AGENT (visible):**
> Done: validation added (`src/auth/signup.ts:42`), lint and tests green, committed.

**FILES:** zero changes (same as JC: the commit lives in git).

---

## Turn 3 — NEW SESSION (fresh t=0, previous context dead)

**USER:**
> what commit standard do we use in this project?

**WHAT THE MODEL RECEIVES RIGHT NOW:**
only the fresh t=0 (≈30k). **No index to read, no fact to open, no rule to
trigger.** The model searches its context and finds nothing.

**AGENT (visible):**
> I don't have that recorded — I don't retain memory between sessions. Want to define a standard now?

Honest and correct: it doesn't invent. But the user has to repeat the preference
in every new session, forever.

**Compare with JC's turn 3:** same "empty" t=0, but JC has the *When to read*
rule + an index on disk → 2 `read`s and it answers the exact standard.

---

## Turn 4 — the test command (same session)

**USER:**
> how do I run the tests in this repo?

**WHAT THE MODEL RECEIVES:** the message + context. It triggers the base Doing
tasks rule: don't assume → search → if missing, **ask and suggest AGENTS.md**.
Identical to JC — this behavior isn't memory, it's the base prompt JC inherited.

**AGENT → USER → AGENT:** same as JC, ends with the command in AGENTS.md. What
Build does **not** do is the second, typed save (it has no `project` memory to
put it in). The knowledge survives anyway via AGENTS.md, which the harness
injects into every future t=0 — that cache is shared by both agents.

---

## Comparative balance (the 4 moments where they differ)

| Moment | Build | Jean Claude |
|---|---|---|
| t=0 | ~30k tokens, 0 memory references | ~25.7k tokens, memory rules but 0 injected memories |
| "remember X" | conversational promise, 0 files | 3–4 tool calls, typed fact + index line |
| Working with an old preference (same session) | applies it if the context has it handy (luck) | applies it via typed `feedback` rule (guarantee) |
| New session + question about the past | "I don't have that recorded" | `read` index → `read` fact → answers exactly |
| "forget X" | nothing to delete | deletes file + line; forgetting verifiable with `ls` |
| Command in AGENTS.md | suggests and writes it (same) | suggests and writes it (same) + typed copy in memory |

**In one line:** Build and JC execute equally well *inside* a session; the whole
difference lives at the edges — what enters context at t=0 (nothing in both,
but JC knows where to look) and what survives closing the session (nothing in
Build, files in JC).
