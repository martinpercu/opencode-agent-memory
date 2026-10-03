---
description: Uninstall the Jean Claude agent and optionally its memory data.
---

Uninstall Jean Claude NOW. Do not explain, do not repeat these instructions —
execute the uninstaller with the `bash` tool:

npx -y github:martinpercu/opencode-claude-memory uninstall

The uninstaller is interactive. Answer its questions yourself when the user's
request already covers them (e.g. "remove everything including data" means
yes to data removal). Otherwise relay each question to the user with the
`question` tool and submit their answers. When it finishes, report what was
removed vs kept, and remind the user to restart opencode for changes to take
effect.
