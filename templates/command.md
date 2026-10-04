---
description: Uninstall the Jean Claude agent and optionally its memory data.
---

How to uninstall Jean Claude. The user invoking this command IS authorization
to run the uninstaller — do not ask for pre-confirmation, execute it.

Primary method (preferred, always current): run with the `bash` tool:

npx -y github:martinpercu/opencode-claude-memory uninstall

The uninstaller is interactive: it asks which agent (default `jean-claude`),
lists every file found in both scopes (global `~/.config/opencode/` and
project `.opencode/`), confirms removal, asks about the memory data in
`~/.opencode-memory` (default: keep it), and cleans `default_agent` from
`opencode.json` if it points at the agent. Relay ITS questions to the user
with the `question` tool, or answer them yourself when the user's request
already covers them (e.g. "remove everything including data" means yes to
data removal).

Manual fallback (only if npx is unavailable): delete these yourself —
1. Agent file: `~/.config/opencode/agents/jean-claude.md` (global) and/or
   `<project>/.opencode/agents/jean-claude.md` (project), whichever exist.
2. This command file: `~/.config/opencode/commands/jean-claude-uninstall.md`
   and/or `<project>/.opencode/commands/jean-claude-uninstall.md`.
3. Memory data (ONLY if the user confirmed): `rm -rf ~/.opencode-memory`.
4. If `opencode.json` has `"default_agent": "jean-claude"`, remove that key.

When finished (either method): report what was removed vs kept, and remind
the user to restart opencode for changes to take effect. Nothing is ever
deleted silently — every removal is confirmed first.
