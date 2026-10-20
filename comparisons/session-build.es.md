<p align="right">🇺🇸 <a href="session-build.md">Read in English</a></p>

# Ejemplo de sesión con Build (reconstrucción ilustrativa)

> Mismo escenario y mismos mensajes de usuario que `session-jean-claude.es.md`.
> La única variable que cambia es el agente — y con él, lo que el modelo recibe.
> No es un log literal: es una reconstrucción fiel de qué recibe el modelo en
> cada momento según el prompt real de build (equivalente a `opencode.md`, 329L).

**Escenario:** proyecto Node en `/Users/martin/demo-shop`. Sin memorias en
ningún lado (build no tiene de dónde leerlas).

## t=0 — lo que recibe el modelo al abrir la sesión

| Capa | Contenido | Costo aprox |
|---|---|---|
| Harness (igual para todos los agentes) | env header, array de tools, skills/MCP, AGENTS.md del proyecto | ~24k tok |
| Agent `build` (compilado en el binario) | `opencode.md` entero: tono, proactividad, Doing tasks, doc de las 11 tools, Git and GitHub | ~6.2k tok |
| **Total t=0** | | **≈ 30k tok** |

**Diferencias de base vs Jean Claude:** +6.2k de documentación genérica,
**cero instrucciones de memoria**, y permiso `external_directory * → ask`
(verificado con `opencode debug agent build`): si intentara leer/escribir fuera
del proyecto, opencode le pediría confirmación al usuario en cada intento.

---

## Turno 1 — el usuario pide recordar (misma frase que en JC)

**USER:**
> recordá que en este proyecto los commits van en español, cortos, con scope, tipo `feat(auth): ...`

**LO QUE RECIBE EL MODELO EN ESTE MOMENTO:**
el mensaje + el contexto t=0. **No dispara nada**: build no tiene ninguna regla
de guardado, ningún índice que revisar, ningún permiso silencioso fuera del
proyecto. La palabra "recordá" es solo conversación.

**TOOLS USADAS:** ninguna.

**ESTADO DE ARCHIVOS:** cero cambios. No existe `~/.opencode-memory`, no existe
índice, no existe fact. Todo lo que "sabe" vive solo en el contexto de esta
sesión y muere con ella.

**AGENTE (visible):**
> ¡Anotado! Commits en español, cortos y con scope a partir de ahora.

Suena igual que JC. La diferencia es que es una **promesa conversacional sin
persistencia**: funciona mientras la sesión viva, se evapora al cerrarla.

---

## Turno 2 — trabajar (misma sesión, el contexto anterior sigue vivo)

**USER:**
> agregá validación de email en el signup y commiteá

**LO QUE RECIBE EL MODELO:** el mensaje + el contexto (incluye la preferencia,
porque fue dicha **en esta misma sesión**). Dispara el *Doing tasks* base
y el bloque *Git and GitHub*.

**FLUJO (invisible):** idéntico al de JC en lo mecánico — search, implement,
tests sin asumir framework, lint/typecheck, `git status`/`diff`/`log`, stage
selectivo, commit. Build **sí** sabe hacer todo eso; su prompt lo cubre.

**PERO el mensaje del commit sale distinto:**
`feat(auth): add email validation` — **en inglés**. La preferencia de español se
dijo en esta sesión así que el modelo la tiene a mano… ¿por qué no la aplica?
Porque nada le dijo que "recordá" era una regla permanente del proyecto vs. un
comentario al pasar: sin frontmatter `type: feedback` con `How to apply`, es
texto más del contexto, fácil de diluir entre todo lo demás. (En la práctica un
modelo bueno a veces lo aplica igual; la diferencia es garantía vs. suerte: JC
tiene la regla tipada en archivo, build tiene un renglón de chat.)

**AGENTE (visible):**
> Listo: validación agregada (`src/auth/signup.ts:42`), lint y tests OK, commiteado.

**ESTADO DE ARCHIVOS:** cero cambios (igual que JC: el commit vive en git).

---

## Turno 3 — SESIÓN NUEVA (t=0 fresco, contexto anterior muerto)

**USER:**
> ¿qué estándar de commits uso en este proyecto?

**LO QUE RECIBE EL MODELO EN ESTE MOMENTO:**
solo el t=0 (≈30k). **No hay índice que leer, no hay fact que abrir, no hay
regla que dispare.** El modelo busca en su contexto y no encuentra nada.

**AGENTE (visible):**
> No tengo registro de eso — no conservo memoria entre sesiones. ¿Querés que definamos un estándar ahora?

Respuesta honesta y correcta: no inventa. Pero el usuario tiene que repetir la
preferencia en cada sesión nueva, para siempre.

**Compará con el turno 3 de JC:** mismo t=0 "vacío", pero JC tiene la regla
*When to read* + un índice en disco → 2 `read`s y responde el estándar exacto.

---

## Turno 4 — el comando de test (misma sesión)

**USER:**
> ¿cómo corro los tests de este repo?

**LO QUE RECIBE EL MODELO:** el mensaje + contexto. Dispara el *Doing tasks* de
build: no asumir → buscar → si no está, **preguntar y sugerir AGENTS.md**.
Idéntico a JC — esta conducta no es de memoria, es del prompt base que JC heredó.

**AGENTE → USER → AGENTE:** igual que en JC, termina con el comando en
AGENTS.md. Lo que build **no** hace es el segundo guardado (no tiene memoria
`project` donde tiparlo). El conocimiento sobrevive igual vía AGENTS.md, que el
harness inyecta en el t=0 de todas las sesiones futuras — ese cache lo comparten
ambos agentes.

---

## Balance comparativo (los 4 momentos donde difieren)

| Momento | Build | Jean Claude |
|---|---|---|
| t=0 | ~30k tok, 0 referencias a memoria | ~25.7k tok, reglas de memoria pero 0 memorias inyectadas |
| "recordá X" | promesa conversacional, 0 archivos | 3-4 tool calls, hecho tipado + línea de índice |
| Trabajo con preferencia vieja (misma sesión) | la aplica si el contexto la tiene a mano (suerte) | la aplica por regla tipada `feedback` (garantía) |
| Sesión nueva + pregunta de pasado | "no tengo registro" | `read` índice → `read` fact → responde exacto |
| "olvidate X" | nada que borrar | borra archivo + línea; olvido verificable en disco |
| Comando en AGENTS.md | lo sugiere y lo escribe (igual) | lo sugiere y lo escribe (igual) + copia tipada en memoria |

**En una línea:** build y JC ejecutan igual de bien *dentro* de una sesión; la
diferencia entera vive en los bordes — qué entra al contexto en t=0 (nada en
ambos, pero JC sabe ir a buscarlo) y qué sobrevive al cerrar la sesión (nada en
build, archivos en JC).

← [Volver al README](../README.es.md)
