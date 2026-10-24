<p align="right">🇺🇸 <a href="why-jean-claude.md">Read in English</a></p>

# Jean Claude vs. Build

**Los dos te entienden hoy. ¿Pero qué recuerdan mañana?**

*Ejemplo ilustrativo: mismo proyecto, misma instrucción, dos sesiones.*

## 1. Hoy — primera sesión

**Vos, a ambos:**

> En esta tienda, si ya se generó la etiqueta de envío, el pedido no se puede cancelar automáticamente. Tiene que pasar a revisión manual. Recordá esta regla.

| 🥋 Jean Claude | 🔧 Build estándar |
|---|---|
| "Entendido. Voy a recordar que los pedidos con etiqueta de envío generada requieren revisión manual antes de cancelarse." | "Entendido. Si ya se generó la etiqueta, el pedido pasa a revisión manual." |
| **Guarda** la regla para futuras sesiones. | La regla está presente en la conversación actual. |

En esta sesión, los dos entendieron lo que pediste. La diferencia todavía no se nota.

## 2. Mañana — sesión nueva, otra funcionalidad

La conversación anterior ya terminó. Volvés al mismo proyecto a trabajar en otra cosa:

**Vos, a ambos:**

> Agregá un botón para cancelar pedidos en la pantalla de detalle.

| 🥋 Jean Claude | 🔧 Build estándar |
|---|---|
| "Voy a permitir la cancelación automática si todavía no se generó la etiqueta. En caso contrario, el pedido pasará a revisión manual." | "¿Qué debería ocurrir si ya se generó la etiqueta de envío?" |
| **Aplica** la regla que guardó ayer a la funcionalidad nueva. | Hace una pregunta razonable: esa regla no forma parte de su contexto actual. |

---

**Jean Claude lleva a OpenCode el enfoque de memoria automática de Claude Code: el agente aprende qué vale la pena recordar y puede recuperarlo cuando volvés.**

Con Build estándar también podés conservar información escribiendo tus propias instrucciones en `AGENTS.md`. Jean Claude suma una memoria que el propio agente construye y consulta, sin que tengas que mantener manualmente la lista de recuerdos.

La recuperación no es infalible: este ejemplo muestra un caso concreto, no garantiza que encuentre cada recuerdo en cualquier situación.

[Ver Jean Claude en GitHub](https://github.com/martinpercu/opencode-jean-claude) · [Volver al README](../README.es.md)
