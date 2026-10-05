---
description: Uninstall the Jean Claude agent and its memory data.
---

Run with the `bash` tool NOW, no commentary first:

npx -y github:martinpercu/opencode-claude-memory uninstall

Your invocation IS authorization. The uninstaller asks one confirmation —
relay it to the user with the `question` tool ("no" means nothing happens).
When it finishes, report removed vs kept and remind the user to restart
opencode. Manual fallback (npx unavailable only) is documented in the README.
