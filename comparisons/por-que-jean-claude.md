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

**Jean Claude programa igual que Build dentro de una sesión. La diferencia es que puede recordar lo importante cuando volvés.**

Con Build estándar, podés conseguir persistencia si guardás las instrucciones por tu cuenta en un archivo de proyecto. Jean Claude suma un sistema de memoria que guarda y recupera esos detalles sin que tengas que mantener manualmente la lista.

El recall es útil pero no infalible: este ejemplo muestra un caso concreto, no garantiza que encuentre cada recuerdo en cualquier situación.

---

[Ver Jean Claude en GitHub](https://github.com/martinpercu/opencode-jean-claude) · [Volver al README](../README.es.md)
