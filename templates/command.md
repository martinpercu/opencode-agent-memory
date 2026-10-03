---
description: Uninstall the Jean Claude agent and optionally its memory data.
---

Uninstall Jean Claude by running its CLI uninstaller and reporting the result.

1. Execute via `bash`: `smart-memory uninstall` and follow its prompts
   (it asks which agent, confirms file removal, and asks whether to also
   delete the memory data in `~/.opencode-memory`).
2. If the user already told you to remove everything including data, answer
   its questions accordingly; otherwise let the user answer.
3. After it finishes, report what was removed and remind the user to restart
   opencode for the change to take effect.
