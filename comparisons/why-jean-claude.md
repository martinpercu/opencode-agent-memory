<p align="right">🇪🇸 <a href="por-que-jean-claude.md">Leer en español</a></p>

# Jean Claude vs. Build: what changes when you come back tomorrow

**The first session may look the same. The difference shows up when you start a new one.**

Imagine you work on a project and teach both agents an important preference.

> *Illustrative example, not a literal transcript. Compares Jean Claude with OpenCode's standard Build agent.*

## 1. First session — you teach them once

**You, to both:**

> For this project, commit messages are in Spanish, short, with scope. Remember that.

| 🥋 Jean Claude | 🔧 Standard Build |
|---|---|
| **"Noted. I'll remember that for future sessions."** | **"Got it! Commits will be in Spanish, short, with scope."** |
| Jean Claude saves that preference so it can retrieve it later. | Build understands the preference in this conversation, but doesn't persist it by default. |

In this session, both understood what you asked. The difference doesn't show yet.

## 2. Next day — you open a new session

The previous conversation is over. You're back on the same project and ask:

**You, to both:**

> What format do we use for commit messages?

| 🥋 Jean Claude | 🔧 Standard Build |
|---|---|
| **"Spanish, short, with scope. For example: `feat(auth): validar email en signup`."** | **"I don't have a record of what we agreed in the previous session. What format do you prefer?"** |
| Retrieves the preference it saved the day before. | It doesn't have that preference from the previous conversation automatically available. |

## That's the difference

**Jean Claude codes just like Build inside a session. The difference is that it can remember what matters when you come back.**

With standard Build, you can get persistence if you save instructions yourself in a project file. Jean Claude adds a memory system that saves and retrieves those details without you having to maintain a reminder list manually.

Recall is useful but not infallible: this example shows one concrete case — it doesn't guarantee every memory will be found in every situation.

---

[See Jean Claude on GitHub](https://github.com/martinpercu/opencode-jean-claude) · [Back to README](../README.md)
