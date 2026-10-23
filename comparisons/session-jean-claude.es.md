<p align="right">🇺🇸 <a href="session-jean-claude.md">Read in English</a></p>

# Ejemplo de sesión con Jean Claude (reconstrucción ilustrativa)

> **Reconstrucción ilustrada, no un transcript.** Mismo escenario y usuario
> que `session-build.es.md`; solo cambia el agente. La mecánica —qué recibe
> el modelo en cada momento— sigue las reglas reales del prompt
> (`templates/instructions.md`); el diálogo es ilustrativo. Los tokens
> están medidos, no estimados.

**Escenario:** proyecto Node en `/Users/martin/demo-shop` → slug `-Users-martin-demo-shop`.
Memoria del proyecto (al empezar): **vacía**.

## t=0 — lo que recibe el modelo al abrir la sesión

| Capa | Contenido | Costo aprox |
|---|---|---|
| Harness (igual para todos los agentes) | env header, array de tools, skills/MCP, AGENTS.md del proyecto | ~24k tok |
| Agent `jean-claude` | frontmatter (opencode lo parsea: `mode: primary`, permisos con `external_directory ~/.opencode-memory/** allow`) + body: memoria + Doing tasks + Git and GitHub + Tool discipline (`instructions.md:85-138`) | ~1.7k tok |
| **Total t=0** | | **≈ 25.7k tok** |

**Punto clave nº 1:** en t=0 **no viene ninguna memoria inyectada**. El índice
`MEMORY.md` no está en el contexto — el modelo debe ir a leerlo con `read`
cuando una regla se lo pide. (En Claude Code real el índice sí viene
auto-cargado; acá es lectura explícita.)

---

## Turno 1 — guardar una preferencia

**USER:**
> recordá que en este proyecto los commits van en español, cortos, con scope, tipo `feat(auth): ...`

**LO QUE RECIBE EL MODELO EN ESTE MOMENTO:**
el mensaje + el contexto t=0. Dispara la regla *When to write* (`instructions.md:70-74`):
"recordá X → guardar inmediatamente". Antes de escribir, la regla exige revisar
el índice por duplicados → `read` de
`~/.opencode-memory/-Users-martin-demo-shop/memory/MEMORY.md` → **no existe** →
bootstrap (`instructions.md:19-22`): `bash mkdir -p .../memory` + `write` de
`MEMORY.md` con `# Memory Index`. Índice vacío = no hay duplicado.

**TOOLS USADAS (invisibles para el usuario):**
`bash` (mkdir) → `write` (MEMORY.md) → `write` (commit-messages-es.md) → `edit` (línea al índice).

**ESTADO DE ARCHIVOS DESPUÉS:**
`~/.opencode-memory/-Users-martin-demo-shop/memory/`
- `MEMORY.md` → `# Memory Index` + `- [Commits en español con scope](commit-messages-es.md) — cortos tipo feat(auth): ...`
- `commit-messages-es.md` → frontmatter (`name: commit-messages-es`, `description: ...`, `metadata: type: feedback`) + body con `**Why:**` / `**How to apply:**`

**AGENTE (visible):**
> Anotado: commits en español, cortos, con scope. Lo aplico desde ahora.

(Corto, sin preámbulo — *General behavior*, `instructions.md:90-91`.)

---

## Turno 2 — trabajar usando la memoria (misma sesión)

**USER:**
> agregá validación de email en el signup y commiteá

**LO QUE RECIBE EL MODELO EN ESTE MOMENTO:**
el mensaje + **todo el contexto anterior sigue vivo** (el índice ya fue leído en
el turno 1, no necesita re-leerlo). Dispara *Doing tasks* (`instructions.md:95-112`).

**FLUJO (invisible):**
`glob`/`grep` (entiende dónde vive el signup) → `edit` (implementa) →
lee `package.json`/README para no asumir el framework de test → `bash` (tests +
lint/typecheck) → `git status` / `git diff` / `git log --oneline -10` (regla
*Git and GitHub*: inspeccionar antes de commitear, `instructions.md:117-118`) →
`stage` solo los archivos del signup → `commit -m "feat(auth): validar email en signup"`.
El mensaje sale **en español por la memoria `feedback`** (Build haría lo
mismo acá — la preferencia es contexto vivo para ambos; la regla tipada
rinde en la sesión siguiente); commitea sin preguntar
porque el usuario lo pidió explícito.

**AGENTE (visible):**
> Listo: validación agregada (`src/auth/signup.ts:42`), lint y tests OK, commiteado como `feat(auth): validar email en signup`.

**ESTADO DE ARCHIVOS:** sin cambios en la memoria — el commit ya quedó en el git
history, y la regla dice no guardar "lo que el repo ya registra" (`instructions.md:78-79`).

---

## Turno 3 — SESIÓN NUEVA (t=0 fresco, contexto anterior muerto)

**USER:**
> ¿qué estándar de commits uso en este proyecto?

**LO QUE RECIBE EL MODELO EN ESTE MOMENTO:**
solo el t=0 (≈25.7k, **sin memorias**). Dispara *When to read*
(`instructions.md:58-60`): pregunta sobre decisiones pasadas → `read` del índice
→ la línea "Commits en español…" pega → `read` de `commit-messages-es.md` →
**el contenido del fact entra al contexto AHORA, en este turno, no antes**.

**AGENTE (visible):**
> En español, cortos, con scope: `feat(auth): ...`.

**Punto clave nº 2:** la memoria entró al contexto en el turno 3 vía 2 `read`s
(índice ~1 línea + fact ~200 tok). Si la pregunta no hubiera pegado con ninguna
línea del índice, el modelo jamás abría nada y respondía sin memoria.

---

## Turno 4 — el truco de AGENTS.md (misma sesión)

**USER:**
> ¿cómo corro los tests de este repo?

**LO QUE RECIBE EL MODELO:** el mensaje + contexto (índice ya leído, nada
relevante para tests → no abre facts). Dispara *Doing tasks*: "NEVER asumir el
framework — check README/codebase". Busca en `package.json`/README → **no hay
script obvio** → la regla manda preguntar (`instructions.md:107-111`).

**AGENTE (visible):**
> No encontré script de test en `package.json` ni en el README. ¿Cuál es el comando?

**USER:**
> es `npm run test:unit`

**MODELO:** corre `bash npm run test:unit` → verde → aplica la segunda mitad de
la regla: sugerir persistirlo en AGENTS.md.

**AGENTE (visible):**
> Tests OK (34 pasando). ¿Lo dejo anotado en AGENTS.md para no preguntar más?

**USER:**
> sí, y guardalo en la memoria del proyecto también

**MODELO:** `edit` de AGENTS.md + `write` de `test-command.md` (`type: project`,
porque es contexto del proyecto no derivable del código) + línea al índice.

**AGENTE (visible):**
> Hecho en ambos lados.

**Punto clave nº 3:** acá se ven los dos caches del sistema trabajando juntos —
AGENTS.md (lo inyecta el harness **gratis en el t=0 de todas las sesiones
futuras** de este proyecto) y la memoria `project` (curaduría tipada, se lee
bajo demanda). Por eso la regla pide sugerir AGENTS.md: convierte un costo de
descubrimiento por-sesión en conocimiento permanente.

---

## Turno 5 — olvidar (OTRA sesión nueva)

**USER:**
> olvidate del estándar de commits en español

**LO QUE RECIBE EL MODELO:** t=0 fresco → `read` del índice → `read` del fact
(verifica cuál borrar) → **borra el archivo + su línea del índice**
(`instructions.md:72-74`).

**AGENTE (visible):**
> Borrado: ya no tengo guardado ningún estándar de commits.

**ESTADO FINAL DE ARCHIVOS:**
`~/.opencode-memory/-Users-martin-demo-shop/memory/`
- `MEMORY.md` → `# Memory Index` + `- [Comando de test](test-command.md) — npm run test:unit`
- `test-command.md` (sigue)
- `commit-messages-es.md` (eliminado, línea del índice removida)

Si en la próxima sesión preguntan por el estándar de commits, el índice ya no lo
lista → el modelo responde que no tiene nada guardado. El olvido es real porque
es un archivo menos, no una promesa conversacional.

---

## Balance de la sesión JC

- **Lecturas de memoria:** ~2 `read`s por sesión donde aplica (índice + fact). Donde no aplica: 1 `read` al índice y nada más.
- **Costo en contexto:** índice (cientos de tok) + solo los facts abiertos (~200 tok c/u). Nada precargado.
- **Escrituras:** inmediatas, durante la conversación — si el chat terminara a mitad, lo ya guardado persiste.
- **Límites honestos:** cada guardado cuesta 3-4 tool calls; cada recuerdo, ~2 reads; si ninguna línea del índice pega, la respuesta es "no tengo nada" igual que Build. Útil pero no infalible.

← [Volver al README](../README.es.md)
