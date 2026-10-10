# Jean Claude 🥋

<p align="center">
  <strong>Roundhouse kick your agent's amnesia.</strong><br />
  Persistent project memory for <a href="https://opencode.ai">OpenCode</a>.
</p>

<p align="center">
  <a href="https://github.com/martinpercu/opencode-claude-memory/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/martinpercu/opencode-claude-memory?style=social" /></a>
  <a href="https://github.com/martinpercu/opencode-claude-memory/blob/main/LICENSE"><img alt="MIT License" src="https://img.shields.io/github/license/martinpercu/opencode-claude-memory" /></a>
</p>

Your AI coding agent is brilliant… until the next session.

Then you're explaining the project again, repeating decisions, and reminding it how to run the tests. Again.

**Meet Jean Claude:** an OpenCode agent that saves useful facts and brings them back when you need them — even in a future session.

No database. No vector store. No background service. Just an agent and local Markdown files.

## 🚀 Install

You need **Node.js 18+** and [OpenCode](https://opencode.ai).

Run this from your project directory:

```bash
npx github:martinpercu/opencode-claude-memory init
```

Follow the confirmation prompt, then restart OpenCode. Jean Claude is installed globally, so one installation can serve all your projects — with separate memory for each one.

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

## 🧠 Why memory matters

Claude Code shows how useful persistent memory can be. Its setup combines different layers:

- **`CLAUDE.md`** — instructions and project guidance.
- **Project memory** — useful facts and decisions for a specific codebase.
- **Personal memory** — preferences that can carry across projects.

Jean Claude brings the **project-memory experience** to OpenCode: fewer repeated explanations, less lost context, and more time building.

> **V1 scope:** Jean Claude keeps memory per project. Shared personal memory across projects is planned for a future version.

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
    ├── MEMORY.md       # Short index
    └── memory/         # One Markdown file per fact
```

## ⚡ How it works

1. Ask Jean Claude to remember something useful.
2. He saves it in a Markdown file and adds a line to the index.
3. In a later session, he checks the index when the task makes that memory relevant.
4. He reads the matching file and uses it to help answer.

**One important detail:** v1 doesn't automatically inject the memory index into the prompt at startup. Jean Claude looks up memories when they seem relevant, so recall is useful but not infallible — just like any AI agent.

## 🧹 Uninstall

```bash
jean-claude uninstall
```

Or use `/jean-claude-uninstall` inside OpenCode. Jean Claude shows what will be removed and asks for confirmation first.

## ⭐ Give your agent a memory

If Jean Claude saves you from explaining the same project twice, **give the repo a star**. It's a tiny click — no roundhouse kick required.

[⭐ Star Jean Claude on GitHub](https://github.com/martinpercu/opencode-claude-memory)

## License

[MIT](LICENSE)
