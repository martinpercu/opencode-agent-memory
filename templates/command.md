---
description: Uninstall the Jean Claude agent and optionally its memory data.
---

How to uninstall Jean Claude. The user invoking this command IS authorization
to run the uninstaller — do not ask for pre-confirmation, execute it.

Primary method (preferred, always current): run with the `bash` tool:

npx -y github:martinpercu/opencode-claude-memory uninstall

The uninstaller announces what it removes (agent file, this command file,
memory data in `~/.opencode-memory`, and the `default_agent` key) and asks a
single confirmation. Relay that ONE question to the user with the `question`
tool and submit their answer — "no" means nothing happens. It never deletes
silently.

Manual fallback (only if npx is unavailable): delete these yourself —
1. Agent file: `~/.config/opencode/agents/jean-claude.md` (global) and/or
   `<project>/.opencode/agents/jean-claude.md` (project), whichever exist.
2. This command file: `~/.config/opencode/commands/jean-claude-uninstall.md`
   and/or `<project>/.opencode/commands/jean-claude-uninstall.md`.
3. Memory data: `rm -rf ~/.opencode-memory`.
4. If `opencode.json` has `"default_agent": "jean-claude"`, remove that key.

When finished (either method): report what was removed, confirm opencode is
exactly as it was before Jean Claude was installed, and remind the user to
restart opencode for changes to take effect.
