---
title: "Glassmorphism Card"
slug: "glassmorphism-card"
category: "css"
tags: ["glassmorphism", "backdrop-filter", "cards", "blur"]
author: "front-skills"
featured: true
difficulty: "intermediate"
agents: ["claude-code", "cursor"]
image: "https://placehold.co/800x500/1c1c1f/22d3ee?text=Glassmorphism"
comparison:
  before: "https://placehold.co/800x500/1c1c1f/71717a?text=Before:+Solid+Card"
  after: "https://placehold.co/800x500/0a0a0a/22d3ee?text=After:+Glass+Card"
description: "Componente card con efecto glassmorphism usando backdrop-filter para crear superficies de vidrio esmerilado"
---

## Glassmorphism Card

El efecto glassmorphism crea superficies que parecen vidrio esmerilado, permitiendo que el contenido de atrás se vea difuminado a través de la card.

### CSS Necesario

```css
.glass-card {
  background: rgba(28, 28, 31, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}
```

### HTML

```html
<div class="glass-card">
  <h3>Título de la Card</h3>
  <p>Contenido con efecto de vidrio esmerilado.</p>
</div>
```

### Compatibilidad

- ✅ Chrome 76+
- ✅ Firefox 103+
- ✅ Safari 9+
- ⚠️ Edge 79+ (basado en Chromium)

### Tips

1. Usa `backdrop-filter: blur()` con valores entre 8px y 20px para mejores resultados
2. El `background` debe tener opacidad inferior a 1 para que el efecto sea visible
3. Agrega `border: 1px solid rgba(255, 255, 255, 0.1)` para simular el brillo del vidrio
