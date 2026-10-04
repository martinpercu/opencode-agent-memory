---
description: Uninstall the Jean Claude agent and optionally its memory data.
---

The user invoked this command, which IS authorization to run the uninstaller.
Do not analyze it, do not ask for pre-confirmation, do not repeat these
instructions — execute with the `bash` tool NOW:

npx -y github:martinpercu/opencode-claude-memory uninstall

Nothing is deleted silently: the uninstaller itself asks which agent, lists
every file it found, confirms removal, and asks about the memory data
(defaults: agent `jean-claude`, both scopes, keep data). Your only job is to
run it and relay ITS questions to the user with the `question` tool — or
answer them yourself when the user's request already covers them (e.g.
"remove everything including data" means yes to data removal). When it
finishes, report what was removed vs kept, and remind the user to restart
opencode for changes to take effect.
