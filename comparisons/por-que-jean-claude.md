<p align="right">🇺🇸 <a href="why-jean-claude.md">Read in English</a></p>

# Jean Claude vs. Build: lo que cambia cuando volvés mañana

**La primera sesión puede parecer igual. La diferencia aparece cuando empezás una nueva.**

Imaginá que trabajás en un proyecto y les enseñás a ambos agentes una preferencia importante.

> *Ejemplo ilustrativo, no una transcripción literal. Compara Jean Claude con el agente Build estándar de OpenCode.*

## 1. Primera sesión — les enseñás una vez

**Vos, a ambos:**

> Para este proyecto, los mensajes de commit van en español, cortos y con scope. Recordalo.

| 🥋 Jean Claude | 🔧 Build estándar |
|---|---|
| **"Anotado. Lo voy a recordar para futuras sesiones."** | **"¡Entendido! Los commits serán en español, cortos y con scope."** |
| Jean Claude guarda esa preferencia para poder recuperarla más adelante. | Build entiende la preferencia en esta conversación, pero no la guarda de forma persistente por defecto. |

En esta sesión, los dos entendieron lo que pediste. La diferencia todavía no se nota.

## 2. Al día siguiente — abrís una sesión nueva

La conversación anterior ya terminó. Volvés al mismo proyecto y preguntás:

**Vos, a ambos:**

> ¿Qué formato usamos para los mensajes de commit?

| 🥋 Jean Claude | 🔧 Build estándar |
|---|---|
| **"En español, cortos y con scope. Por ejemplo: `feat(auth): validar email en signup`."** | **"No tengo registrado lo que acordamos en la sesión anterior. ¿Qué formato preferís?"** |
| Recupera la preferencia que guardó el día anterior. | No tiene esa preferencia de la conversación anterior disponible automáticamente. |

## Esa es la diferencia

**Jean Claude lleva a OpenCode el enfoque de memoria automática de Claude Code: el agente aprende qué vale la pena recordar y puede recuperarlo cuando volvés.**

Con Build estándar también podés conservar información escribiendo tus propias instrucciones en `AGENTS.md`. Jean Claude suma una memoria que el propio agente construye y consulta, sin que tengas que mantener manualmente la lista de recuerdos.

La recuperación no es infalible: este ejemplo muestra un caso concreto, no garantiza que encuentre cada recuerdo en cualquier situación.

---

[Ver Jean Claude en GitHub](https://github.com/martinpercu/opencode-jean-claude) · [Volver al README](../README.es.md)
