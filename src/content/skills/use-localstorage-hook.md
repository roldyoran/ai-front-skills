---
title: "React Hook: useLocalStorage"
slug: "use-localstorage-hook"
category: "react"
tags: ["hooks", "localStorage", "state", "persistence"]
author: "front-skills"
featured: true
difficulty: "intermediate"
agents: ["claude-code", "cursor"]
image: "https://placehold.co/800x500/1c1c1f/60a5fa?text=useLocalStorage"
comparison:
  before: "https://placehold.co/800x500/1c1c1f/71717a?text=Before:+Manual+Storage"
  after: "https://placehold.co/800x500/0a0a0a/60a5fa?text=After:+Custom+Hook"
description: "Hook personalizado para persistir estado en localStorage con serialización automática"
---

## useLocalStorage Hook

Un hook que sincroniza el estado de React con localStorage, permitiendo persistencia de datos entre sesiones.

### Código

```tsx
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
```

### Uso

```tsx
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  const [lang, setLang] = useLocalStorage('lang', 'es');

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
  );
}
```

### Características

- ✅ Serialización JSON automática
- ✅ Hydration-safe (evita errores SSR)
- ✅ TypeScript completo
- ✅ Manejo de errores
