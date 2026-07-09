---
title: "Astro View Transitions"
slug: "astro-view-transitions"
category: "astro"
tags: ["transitions", "animation", "navigation", "spa"]
author: "front-skills"
featured: true
difficulty: "advanced"
agents: ["claude-code", "cursor"]
image: "https://placehold.co/800x500/1c1c1f/ff5d01?text=View+Transitions"
comparison:
  before: "https://placehold.co/800x500/1c1c1f/71717a?text=Before:+Full+Reload"
  after: "https://placehold.co/800x500/0a0a0a/ff5d01?text=After:+Smooth+Transition"
description: "Navegación fluida entre páginas con View Transitions API de Astro"
---

## Astro View Transitions

View Transitions permite crear navegación SPA-like en Astro sin sacrificar el rendimiento de SSG.

### Configuración

```astro
---
// En el layout base
import { ViewTransitions } from 'astro:transitions';
---

<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Directrices de Transición

```astro
---
// Página de destino
---

<h1 transition:animate="fade">Título Animado</h1>

<div transition:animate="slide">
  Contenido con transición slide
</div>
```

### Animaciones Personalizadas

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fade-in 0.3s ease-out;
}
```

### Named Transitions

```astro
---
// Para animar el mismo elemento entre páginas
---

<img transition:name="hero-image" src="..." />
<h1 transition:name="page-title">...</h1>
```

### Hooks de Lifecycle

```js
// Se ejecuta en cada transición
document.addEventListener('astro:page-load', () => {
  console.log('Page loaded');
});

document.addEventListener('astro:after-swap', () => {
  console.log('Content swapped');
});
```

### Tips

1. Usa `transition:animate="none"` para elementos que no deben animarse
2. Named transitions son ideales para imágenes y títulos que se mantienen entre páginas
3. Combina con `client:visible` para componentes interactivos
