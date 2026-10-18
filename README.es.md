<p align="right">🌐 <a href="README.md">Read in English</a></p>

# Jean Claude 🥋

```text
      _                     ____  _                 _         _ 
     | | ___  __ _ _ __    / ___|| | __ _ _   _  __| | ___   | |
  _  | |/ _ \/ _` | '_ \  | |    | |/ _` | | | |/ _` |/ _ \  | |
 | |_| |  __/ (_| | | | | | |___ | | (_| | |_| | (_| |  __/  |_|
  \___/ \___|\__,_|_| |_|  \____||_|\__,_|\__,_|\__,_|\___|  (_)
```

<p align="center">
  <strong>Dale a la amnesia de tu agente una patada voladora.</strong><br />
  Memoria de proyecto persistente para <a href="https://opencode.ai">OpenCode</a>.
</p>

<p align="center">
  <a href="https://github.com/martinpercu/opencode-claude-memory/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/martinpercu/opencode-claude-memory?style=social" /></a>
  <a href="https://github.com/martinpercu/opencode-claude-memory/blob/main/LICENSE"><img alt="MIT License" src="https://img.shields.io/github/license/martinpercu/opencode-claude-memory" /></a>
</p>

Tu agente de IA es brillante… hasta la próxima sesión.

Después estás explicando el proyecto de nuevo, repitiendo decisiones y recordándole cómo correr los tests. Otra vez.

**Te presentamos a Jean Claude:** un agente de OpenCode que guarda datos útiles y los trae de vuelta cuando los necesitás — incluso en una sesión futura.

Sin base de datos. Sin vector store. Sin servicio en background. Solo un agente y archivos Markdown locales.

## 🚀 Instalación

Necesitás **Node.js 18+** y [OpenCode](https://opencode.ai).

Corré esto desde tu proyecto:

```bash
npx github:martinpercu/opencode-claude-memory init
```

Seguí el prompt de confirmación y reiniciá OpenCode. Jean Claude se instala global, así que una instalación sirve para todos tus proyectos — con memoria separada para cada uno.

Si ya usás Claude Code, `init` también copia las memorias por proyecto que encuentre en `~/.claude/projects/*/memory/`, así Jean Claude arranca con tu historial. Es una copia única — nada en `~/.claude` se modifica ni se borra.

## 🥋 Probalo

```text
Vos: Recordá que este proyecto usa pnpm y Vitest.

# Más tarde, incluso en una sesión nueva...
Vos: ¿Cómo corremos los tests?
Jean Claude: Usá pnpm vitest ...

# ¿Cambiaste de idea?
Vos: Olvidate del comando de test viejo.
```

Pedile a Jean Claude en lenguaje normal que recuerde, recupere u olvide algo.

## 🧠 No es otro `CLAUDE.md`

Si usaste Claude Code, sabés lo útil que es cuando tu agente recuerda cosas entre sesiones.

Ese es **el sistema de auto-memoria de Claude Code** — y Jean Claude trae esa misma idea central a OpenCode.

Pero hay una distinción importante.

### 📖 Instrucciones vs. memoria

Pensalo así:

* **`CLAUDE.md` / `AGENTS.md` = El manual del empleado.** Vos escribís las reglas, convenciones e instrucciones. Cómo trabajar, qué comandos correr, qué estándares seguir.

* **La memoria de Jean Claude = El diario de trabajo.** Jean Claude registra cosas útiles que descubren juntos: decisiones que tomaron, cosas que no funcionaron, rarezas del proyecto y lecciones que vale la pena recordar la próxima vez.

|                          | Instrucciones          | Jean Claude                  |
| ------------------------ | ---------------------- | ---------------------------- |
| **¿Quién lo escribe?**   | Vos                    | Tu agente                    |
| **¿Qué lleva?**          | Reglas y guías         | Decisiones y descubrimientos |
| **¿Dónde vive?**         | Normalmente en tu repo | Memoria local, fuera del repo |
| **¿Persiste?**           | Sí                     | Sí, entre sesiones           |

**El manual le dice a tu agente cómo trabajar. Jean Claude recuerda lo que aprendieron juntos.**

Se complementan. Mantené tus instrucciones en `CLAUDE.md` o `AGENTS.md` — y dejá que Jean Claude recuerde el resto.

> **V1:** Solo memoria por proyecto. Cada proyecto tiene sus memorias. La memoria personal entre proyectos está planeada para una versión futura.

## 🥊 `Build` estándar vs Jean Claude

| Característica | `Build` estándar | 🥋 Jean Claude |
| :--- | :--- | :--- |
| **System prompt** | OpenCode por defecto | System prompt con protocolo de memoria |
| **Memoria entre sesiones** | Ninguna — cada sesión arranca en blanco | Persistente (`~/.opencode-memory/<slug>/memory/`) |
| **Búsqueda en memoria** | N/A | Índice lazy (`MEMORY.md` → archivo del dato, solo cuando pega) |
| **Tu repo de git** | — | Intacto (las memorias viven fuera del repo) |
| **Popups de permisos** | Prompts estándar | La memoria nunca pide permiso; lo demás pregunta como siempre |
| **`Build`/`Plan` después de instalar** | — | Idénticos, cero efectos secundarios |

> 📖 ¿Querés el paso a paso? [Misma sesión, lado a lado: Jean Claude vs `Build` estándar](comparisons/jc-vs-build.es.md) — qué recibe cada modelo en cada paso.

## ✨ Qué hace Jean Claude

- **Recuerda datos útiles:** decisiones del proyecto, comandos, convenciones, preferencias y trampas.
- **Los encuentra después:** revisa un índice corto y lee archivos de memoria individuales cuando pegan.
- **Mantiene los proyectos separados:** las memorias de un proyecto no se filtran al contexto de otro.
- **Sigue local y legible:** la memoria es Markdown plano que podés inspeccionar, editar, backupear o borrar.
- **Saltea la maquinaria extra:** sin plugin ni servidor de memoria en v1; las instrucciones del agente y las file tools de OpenCode hacen el trabajo.

## 📂 Dónde viven las memorias

```text
~/.opencode-memory/
└── <tu-proyecto>/
    └── memory/
        ├── MEMORY.md       # Índice corto
        └── <dato>.md       # Un archivo Markdown por dato
```

## ⚡ Cómo funciona

1. Pedile a Jean Claude que recuerde algo útil.
2. Lo guarda en un archivo Markdown y agrega una línea al índice.
3. En una sesión posterior, revisa el índice cuando la tarea hace relevante esa memoria.
4. Lee el archivo correspondiente y lo usa para ayudar a responder.

**Un detalle importante:** v1 no inyecta automáticamente el índice de memoria en el prompt al arrancar. Jean Claude busca memorias cuando parecen relevantes, así que el recall es útil pero no infalible — como cualquier agente de IA.

## 🧹 Desinstalación

```bash
npx github:martinpercu/opencode-claude-memory uninstall
```

O usá `/jean-claude-uninstall` dentro de OpenCode. Jean Claude muestra lo que se va a borrar y pide confirmación antes.

## ⭐ Dale memoria a tu agente

Si Jean Claude te salva de explicar dos veces el mismo proyecto, **dale una estrella al repo**. Es un click chiquito — sin patada voladora.

[⭐ Jean Claude en GitHub](https://github.com/martinpercu/opencode-claude-memory)

## Licencia

[MIT](LICENSE)
