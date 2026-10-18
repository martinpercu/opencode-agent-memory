<p align="right">🌐 <a href="README.es.md">Leer en español</a></p>

# Jean Claude 🥋

```text
     _                     ____  _                 _         _ 
    | | ___  __ _ _ __    / ___|| | __ _ _   _  __| | ___   | |
 _  | |/ _ \/ _` | '_ \  | |    | |/ _` | | | |/ _` |/ _ \  | |
| |_| |  __/ (_| | | | | | |___ | | (_| | |_| | (_| |  __/  |_|
 \___/ \___|\__,_|_| |_|  \____||_|\__,_|\__,_|\__,_|\___|  (_)
```

<p align="center">
  <strong>Roundhouse kick your agent's amnesia.</strong><br />
  Persistent project memory for <a href="https://opencode.ai">OpenCode</a>.
</p>

<p align="center">
  <a href="https://github.com/martinpercu/opencode-jean-claude/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/martinpercu/opencode-jean-claude?style=social" /></a>
  <a href="https://github.com/martinpercu/opencode-jean-claude/blob/main/LICENSE"><img alt="MIT License" src="https://img.shields.io/github/license/martinpercu/opencode-jean-claude" /></a>
</p>

Your AI coding agent is brilliant… until the next session.

Then you're explaining the project again, repeating decisions, and reminding it how to run the tests. Again.

**Meet Jean Claude:** an OpenCode agent that saves useful facts and brings them back when you need them — even in a future session.

No database. No vector store. No background service. Just an agent and local Markdown files.

## 🚀 Install

You need **Node.js 18+** and [OpenCode](https://opencode.ai).

Run this from your project directory:

```bash
npx github:martinpercu/opencode-jean-claude init
```

Follow the confirmation prompt, then restart OpenCode. Jean Claude is installed globally, so one installation can serve all your projects — with separate memory for each one.

If you already use Claude Code, `init` also copies any existing per-project memories it finds in `~/.claude/projects/*/memory/`, so Jean Claude starts with your history. It's a one-time copy — nothing in `~/.claude` is ever modified or deleted. If a project gains Claude Code memories after install, Jean Claude inherits them on first use there (read-only); if both sides already hold memories, it shows you both and asks how to proceed.

## 🥋 Try it

```text
You: Remember that this project uses pnpm and Vitest.

# Later, even in a new session...
You: How do we run the tests?
Jean Claude: Use pnpm vitest ...

# Changed your mind?
You: Forget the old test command.
```

Just ask Jean Claude to remember, retrieve, or forget something in plain language.

## 🧠 Not another `CLAUDE.md`

If you've used Claude Code, you know how useful it is when your agent remembers things between sessions.

That's **Claude Code's auto-memory system** — and Jean Claude brings that same core idea to OpenCode.

But there's an important distinction.

### 📖 Instructions vs. memory

Think of it like this:

* **`CLAUDE.md` / `AGENTS.md` = The employee handbook.** You write the rules, conventions, and instructions. How to work, which commands to run, what standards to follow.

* **Jean Claude's memory = The work diary.** Jean Claude records useful things you discover together: decisions you made, things that didn't work, project quirks, and lessons worth remembering next time.

|                         | Instructions         | Jean Claude                     |
| ----------------------- | -------------------- | ------------------------------- |
| **Who writes it?**      | You                  | Your agent                      |
| **What goes in?**       | Rules & guidelines   | Decisions & discoveries         |
| **Where does it live?** | Usually in your repo | Local memory, outside your repo |
| **Does it persist?**    | Yes                  | Yes, across sessions            |

**The handbook tells your agent how to work. Jean Claude remembers what you learned together.**

They complement each other. Keep your instructions in `CLAUDE.md` or `AGENTS.md` — and let Jean Claude remember the rest.

> **V1:** Project memory only. Each project gets its own memories. Cross-project personal memory is planned for a future version.

## 🥊 Standard `Build` vs Jean Claude

| Feature | Standard `Build` | 🥋 Jean Claude |
| :--- | :--- | :--- |
| **System prompt** | Default OpenCode | Memory-protocol system prompt |
| **Cross-session memory** | None — every session starts blank | Persistent (`~/.opencode-memory/<slug>/memory/`) |
| **Memory lookup** | N/A | Lazy index (`MEMORY.md` → fact file, only when relevant) |
| **Your git repo** | — | Untouched (memories live outside the repo) |
| **Permission popups** | Standard prompts | Memory access never prompts; everything else asks as usual |
| **`Build`/`Plan` after installing** | — | Byte-identical, zero side effects |

> 📖 Want the play-by-play? [Same session, side by side: Jean Claude vs standard `Build`](comparisons/jc-vs-build.md) — what each model receives at every step.

## ✨ What Jean Claude does

- **Remembers useful facts:** project decisions, commands, conventions, preferences, and gotchas.
- **Finds them later:** checks a short index, then reads individual memory files when relevant.
- **Keeps projects separate:** one project's memories don't leak into another project's context.
- **Stays local and readable:** memory is plain Markdown you can inspect, edit, back up, or delete.
- **Skips the extra machinery:** no plugin or memory server in v1; the agent's instructions and OpenCode's existing file tools do the work.

## 📂 Where memories live

```text
~/.opencode-memory/
└── <your-project>/
    └── memory/
        ├── MEMORY.md       # Short index
        └── <fact>.md       # One Markdown file per fact
```

## ⚡ How it works

1. Ask Jean Claude to remember something useful.
2. He saves it in a Markdown file and adds a line to the index.
3. In a later session, he checks the index when the task makes that memory relevant.
4. He reads the matching file and uses it to help answer.

**One important detail:** v1 doesn't automatically inject the memory index into the prompt at startup. Jean Claude looks up memories when they seem relevant, so recall is useful but not infallible — just like any AI agent.

## 🧹 Uninstall

```bash
npx github:martinpercu/opencode-jean-claude uninstall
```

Or use `/jean-claude-uninstall` inside OpenCode. Jean Claude shows what will be removed and asks for confirmation first.

## ⭐ Give your agent a memory

If Jean Claude saves you from explaining the same project twice, **give the repo a star**. It's a tiny click — no roundhouse kick required.

[⭐ Star Jean Claude on GitHub](https://github.com/martinpercu/opencode-jean-claude)

## License

[MIT](LICENSE)
