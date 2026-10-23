<p align="right">🇺🇸 <a href="jc-vs-build.md">Read in English</a></p>

# Jean Claude vs Build — misma sesión, lado a lado

> **Reconstrucción ilustrada, no un transcript.** La mecánica —qué recibe cada
> modelo, qué regla dispara, qué archivos cambian— sigue los prompts reales
> línea por línea. El diálogo es ilustrativo. Los tokens están medidos de los
> archivos reales (`wc -c` ÷ 4), no estimados. Versiones completas sin abreviar:
> [Jean Claude](session-jean-claude.es.md) · [Build](session-build.es.md).

**Escenario:** proyecto Node en `/Users/martin/demo-shop` → slug `-Users-martin-demo-shop`.
Memoria del proyecto (al empezar): **vacía**.

## t=0 — lo que recibe cada modelo al abrir la sesión

| Capa | 🥋 Jean Claude | 🔧 Build estándar |
|---|---|---|
| Harness (igual para ambos) | ~24k tok: env, tools, skills, AGENTS.md | ~24k tok: env, tools, skills, AGENTS.md |
| Agent prompt | ~1.7k: reglas de memoria + Doing tasks + Git and GitHub + Tool discipline | ~6.2k: prompt default completo (tono, doc de 11 tools, git) |
| Memorias inyectadas | **0** — el índice se lee con `read` bajo demanda | **0** — no hay de dónde leer |
| **Total t=0** | **≈ 25.7k tok** | **≈ 30k tok** |

> **Nota de honestidad.** Esto compara JC contra Build stock, sin workarounds
> manuales. Un usuario prolijo puede mantener `AGENTS.md` a mano y lograr
> persistencia entre sesiones sin JC. El diferenciador no es memoria vs
> amnesia — es **quién cura**: vos, a mano, en un doc vs el agente solo,
> por hecho, con índice, tipos y chequeos de staleness.

---

## Turno 1 — "recordá que los commits van en español, cortos, con scope"

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Recibe** | msg + t=0 → dispara *When to write* → revisa índice → no existe → bootstrap (`mkdir` + seed de `MEMORY.md`) | msg + t=0 → **no dispara nada**: sin regla de guardado, sin índice, sin permiso silencioso |
| **Tools** | `bash`, `write` ×2, `edit` | ninguna |
| **Archivos después** | `MEMORY.md` + `commit-messages-es.md` (`type: feedback` + `Why`/`How to apply`) | cero archivos en ningún lado |
| **Responde** | "Anotado: commits en español, cortos, con scope." | "¡Anotado! Commits en español…" (mismas palabras, **sin persistencia**) |

> **Diferencia:** JC convierte la frase en un dato tipado en disco; Build la convierte en contexto de chat que muere con la sesión.

---

## Turno 2 — "agregá validación de email en el signup y commiteá" (misma sesión) — **empate**

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Recibe** | msg + contexto vivo (índice ya leído en turno 1) → *Doing tasks* | msg + contexto vivo — la preferencia de español se dijo hace dos turnos y está fresca para ambos → *Doing tasks* base |
| **Hace** | search → implementa → tests sin asumir runner → `git status/diff/log` → stage solo signup → commit | mecánicamente idéntico — el prompt de Build lo cubre todo |
| **Mensaje del commit** | `feat(auth): validar email en signup` — español. Ambos la aplican: la preferencia es contexto vivo, no hace falta archivo. | `feat(auth): validar email en signup` — español, misma razón |
| **Archivos después** | sin cambio en memoria (el commit vive en git history) | sin cambio |

> **Diferencia: ninguna.** Dentro de una sesión, Build es igual a JC. La ventaja de JC no es aplicar la preferencia ahora — es seguir teniéndola en un mes. El payoff es el turno 3, no este.

---

## Turno 3 — SESIÓN NUEVA: "¿qué estándar de commits uso?" — **el momento decisivo**

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Recibe** | t=0 fresco (**sin memorias**) → *When to read* → `read` índice → la línea pega → `read` fact → **el contenido entra al contexto AHORA** | t=0 fresco → **sin índice, sin fact, sin regla** → no encuentra nada |
| **Responde** | "En español, cortos, con scope: `feat(auth): …`" | "No tengo registro de eso — no conservo memoria entre sesiones." |

> **Diferencia:** mismo t=0 "vacío", resultado opuesto. JC sabe dónde buscar; Build no tiene dónde buscar.

---

## Turno 4 — "¿cómo corro los tests?" (misma sesión)

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Recibe** | msg + contexto → *Doing tasks*: nunca asumir → buscar → sin script → **preguntar** | regla idéntica → **preguntar** |
| **Flujo** | usuario: `npm run test:unit` → corre → verde → **sugiere AGENTS.md** → usuario agrega "guardalo en memoria también" → `edit` AGENTS.md + `write` `test-command.md` (`type: project`) + línea al índice | usuario: `npm run test:unit` → corre → verde → **sugiere AGENTS.md** → queda ahí, fin de la historia |
| **Sobrevive vía** | AGENTS.md (gratis en todo t=0 futuro) **+** memoria `project` tipada | solo AGENTS.md — cache compartido, ambos agentes lo reciben |

> **Dos stores, una jerarquía.** `AGENTS.md` es el manual del usuario (escrito a mano, versionado en git, inyectado gratis cada t=0); la memoria del proyecto es el diario del agente (curaduría del agente, fuera del repo). En conflicto gana el manual — la memoria es contexto de fondo, no instrucción. La duplicación es deliberada: distinto dueño, distinto trabajo. En conducta son idénticos acá: esta regla no es memoria, es el prompt base que JC heredó.

---

## Turno 5 — SESIÓN NUEVA: "olvidate del estándar de commits en español"

| | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| **Recibe** | t=0 fresco → `read` índice → `read` fact → **borra archivo + línea del índice** | n/a — nunca se guardó nada |
| **Responde** | "Borrado: ya no tengo guardado ningún estándar de commits." | (misma pregunta que turno 3 → "sin registro") |
| **Verificable** | `ls` del memory dir: un archivo menos | — |

> **Diferencia:** el olvido de JC es un archivo borrado (chequeable en disco); el "olvido" de Build es automático — nunca recordó.

---

## Balance — incluyendo los costos de JC

| Momento | 🥋 Jean Claude | 🔧 Build |
|---|---|---|
| t=0 | ~25.7k, reglas pero 0 memorias inyectadas | ~30k, 0 referencias a memoria |
| "recordá X" | 3-4 tool calls, hecho tipado + línea de índice | promesa conversacional, 0 archivos |
| Preferencia viva, misma sesión | **empate** — ambos la aplican desde el contexto | **empate** |
| Sesión nueva + pregunta de pasado | `read` índice → `read` fact → responde exacto | "no tengo registro" |
| "olvidate X" | borra archivo + línea (verificable con `ls`) | nada que borrar |
| Truco AGENTS.md | igual + copia tipada en memoria | igual |
| Miss de recall (ninguna línea pega) | "sin registro" — igual que Build | "sin registro", siempre |
| Costo de guardar | 3-4 tool calls + tokens, una vez por hecho | 0 (no se guarda nada) |
| Costo de recordar | ~2 reads por sesión relevante (latencia + tokens); el índice crece con cada memoria | 0 |
| Datos stale | posibles; mitigados con verificar-antes-de-recomendar, no eliminados | n/a |

El recall es útil pero no infalible — es el aviso del propio README, y la versión honesta de esta tabla: cuando el match de relevancia falla, JC responde igual que Build.

**En una línea:** ambos ejecutan igual de bien *dentro* de una sesión; la
diferencia entera vive en los bordes — qué entra al contexto en t=0 (nada en
ambos, pero JC sabe ir a buscarlo) y qué sobrevive al cerrar la sesión (nada en
Build, archivos en JC).

Versiones completas: [sesión Jean Claude](session-jean-claude.es.md) · [sesión Build](session-build.es.md) · ← [README](../README.es.md)
