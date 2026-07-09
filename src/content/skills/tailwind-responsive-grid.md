---
title: "Tailwind Responsive Grid"
slug: "tailwind-responsive-grid"
category: "tailwind"
tags: ["grid", "responsive", "layout", "flexbox"]
author: "front-skills"
featured: true
difficulty: "beginner"
agents: ["claude-code", "cursor"]
image: "https://placehold.co/800x500/1c1c1f/38bdf8?text=Responsive+Grid"
comparison:
  before: "https://placehold.co/800x500/1c1c1f/71717a?text=Before:+Fixed+Layout"
  after: "https://placehold.co/800x500/0a0a0a/38bdf8?text=After:+Responsive+Grid"
description: "Sistema de grid responsive con Tailwind CSS que se adapta a todos los tamaños de pantalla"
---

## Tailwind Responsive Grid

Crear layouts responsive con Tailwind CSS es rápido y mantenible usando sus utilidades de grid.

### Patrones de Grid

#### 2 Columnas Responsive
```html
<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
  <div>Columna 1</div>
  <div>Columna 2</div>
</div>
```

#### 3 Columnas Responsive
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### Grid Auto-Fill
```html
<div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
  <div>Auto item 1</div>
  <div>Auto item 2</div>
  <div>Auto item 3</div>
</div>
```

### Breakpoints

| Clase | Tamaño | Uso |
|-------|--------|-----|
| `sm:` | 640px | Móviles landscape |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops pequeños |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Pantallas grandes |

### Tips

1. Usa `gap-` en lugar de márgenes para espaciado consistente
2. Combina con `auto-fill` y `minmax()` para grids verdaderamente fluidos
3. Usa `order-*` para reordenar elementos en diferentes breakpoints
