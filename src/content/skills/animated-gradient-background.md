---
title: "Animated Gradient Background"
slug: "animated-gradient-background"
category: "css"
tags: ["gradient", "animation", "background", "keyframes"]
author: "front-skills"
featured: true
difficulty: "beginner"
agents: ["claude-code", "cursor"]
image: "https://placehold.co/800x500/1c1c1f/c084fc?text=Gradient+Animation"
comparison:
  before: "https://placehold.co/800x500/1c1c1f/71717a?text=Before:+Static+BG"
  after: "https://placehold.co/800x500/0a0a0a/c084fc?text=After:+Animated+BG"
description: "Fondo con gradiente animado que crea movimiento visual constante y atractivo"
---

## Animated Gradient Background

Los gradientes animados añaden dinamismo visual a cualquier sitio web sin sacrificar rendimiento.

### CSS

```css
.animated-gradient {
  background: linear-gradient(
    -45deg,
    #0a0a0a,
    #1c1c1f,
    #0891b2,
    #22d3ee
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Uso

```html
<div class="animated-gradient">
  <h1>Contenido sobre gradiente animado</h1>
</div>
```

### Optimización

- Usa `will-change: background-position` para habilitar aceleración por GPU
- Limita la animación a 15-20 segundos para evitar mareos
- Considera `prefers-reduced-motion` para accesibilidad
