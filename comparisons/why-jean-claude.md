<p align="right">🇪🇸 <a href="por-que-jean-claude.md">Leer en español</a></p>

# Jean Claude vs. Build

**Both understand you now. What about later?**

*Illustrative example: same project, same instruction, two sessions.*

## 1. First session — you teach them once

**You, to both:**

> In this store, if the shipping label was already generated, the order cannot be cancelled automatically. It has to go to manual review. Remember this rule.

| 🥋 Jean Claude | 🔧 Standard Build |
|---|---|
| "Understood. I'll remember that orders with a generated shipping label require manual review before cancellation." | "Understood. If the label was generated, the order goes to manual review." |
| **Saves** the rule for future sessions. | The rule is present in the current conversation. |

In this session, both understood what you asked. The difference doesn't show yet.

## 2. Another feature — when the rule matters

**You, to both:**

> Add a button to cancel orders on the detail screen.

| 🥋 Jean Claude | 🔧 Standard Build |
|---|---|
| "I'll allow automatic cancellation if the label hasn't been generated yet. Otherwise, the order will go to manual review." | "What should happen if the shipping label was already generated?" |
| **Applies** the saved rule to the new feature. | Asks a reasonable question: that rule isn't part of its current context. |

---

**Jean Claude brings Claude Code's auto-memory approach to OpenCode: the agent learns what's worth remembering and can retrieve it when you come back.**

With standard Build you can also preserve information by writing your own instructions in `AGENTS.md`. Jean Claude adds a memory the agent itself builds and queries, without you having to maintain the reminder list manually.

Recall is not infallible: this example shows one concrete case — it doesn't guarantee every memory will be found in every situation.

[See Jean Claude on GitHub](https://github.com/martinpercu/opencode-jean-claude) · [Back to README](../README.md)
