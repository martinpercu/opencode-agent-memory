# 🥋 opencode-claude-memory

> **Give OpenCode the persistent brain of Claude Code.**  
> A non-invasive, prompt-engineered agent (`Jean Claude`) that brings cross-session memory to OpenCode using isolated project slugs, lazy-indexing, and scoped permissions.

[![OpenCode Compatible](https://img.shields.io/badge/OpenCode-Agent-blue.svg)](https://opencode.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 💡 The Core Idea

Default AI coding agents suffer from **session amnesia**. The moment you close the terminal, they forget your project's quirks, local environment setups, and past debugging breakthroughs.

`Jean Claude` is a custom OpenCode agent designed to mirror Claude Code’s persistent memory patterns **without modifying OpenCode’s native behavior, core harness, or touching `Build`/`Plan` modes.**

```text
OpenCode Agent Selector: [ Build | Plan | 🥋 Jean Claude ]
```

---

## 🔬 How It Works (Under the Hood)

Unlike heavy plugins or binary hacks, `Jean Claude` operates **100% through agent prompt architecture and scoped frontmatter permissions**:

1. **Deterministic Slug Isolation:**  
   Derives a clean project slug directly from the `Working directory` in OpenCode's environment header, storing all memories out-of-tree in `~/.opencode-memory/<slug>/`. Your Git history remains untouched.
2. **Lazy-Index Architecture (`1-fact-1-file`):**  
   To prevent token bloat, `Jean Claude` reads `MEMORY.md` as a lightweight index first. It only opens specific granular fact files when relevant to your current prompt.
3. **Seamless Permission Scoping:**  
   Configured with `external_directory: allow` strictly scoped to `~/.opencode-memory/`. Memory reads and writes happen silently in the background while your actual filesystem retains full `ask`/security prompts.
4. **Zero Impact on Native Modes:**  
   `Build` and `Plan` remain 100% byte-identical. Switching agents with `Tab` instantly swaps the system prompt at $t=0$ without altering OpenCode's underlying context compaction or `<system-reminder>` pipeline.

---

## ⚡ Quickstart (Global 1-Line Install)

Install once globally. `Jean Claude` automatically boots and bootstraps memories for any project you open in OpenCode.

```bash
npx opencode-claude-memory
```

### What the installer does:
```text
🥋 JEAN CLAUDE INSTALLED SUCCESSFULLY

 [✓] Agent file created: ~/.opencode/agents/jean-claude.md
 [✓] Scoped storage ready: ~/.opencode-memory/
 [✓] Permissions granted: Auto-allow for ~/.opencode-memory/ only

Ready to rock! Select 'Jean Claude' in OpenCode using Tab.
```

---

## 🥊 Comparison: Standard `Build` vs. `Jean Claude`

| Feature | Standard `Build` | 🥋 `Jean Claude` |
| :--- | :--- | :--- |
| **System Prompt** | Default OpenCode | Memory-protocol system prompt |
| **Cross-Session Memory** | ❌ None | ✅ Persistent (`~/.opencode-memory/<slug>/`) |
| **Memory Lookup** | N/A | ✅ Lazy-indexed (`MEMORY.md` $\rightarrow$ fact file) |
| **Git Working Tree** | Touched | ✅ Clean (Out-of-repo storage) |
| **Permission Interruptions** | Standard prompts | ✅ Auto-allowed for internal memory only |
| **Side Effects on `Build`/`Plan`** | N/A | ✅ **Zero** (100% isolated) |

---

## 🛠️ Usage Example

1. Open OpenCode in any project:
   ```bash
   opencode
   ```
2. Switch to **`Jean Claude`** in the agent picker (`Tab`).
3. Teach him something once:
   > *"We use `pnpm` here, and local tests require `docker-compose.test.yml` up."*
4. Next week, in a fresh session:
   > *"Run the auth test suite."*
   
   `Jean Claude` will lazy-read his memory index, pull the Docker setup rule, and run the correct `pnpm` command without asking you to re-explain your environment.

---

## 🗑️ Uninstallation

If you ever want to remove `Jean Claude`, simply run:

```bash
npx opencode-claude-memory --uninstall
```
*Removes the agent definition from `~/.opencode/agents/` without touching your stored memories.*

---

## 📄 License

[MIT](LICENSE) - Built for the OpenCode community.