---
title: "Git Aliases Productivity"
slug: "git-aliases-productivity"
category: "tools"
tags: ["git", "aliases", "productivity", "terminal"]
author: "front-skills"
featured: false
difficulty: "beginner"
agents: ["claude-code", "cursor"]
image: "https://placehold.co/800x500/1c1c1f/a78bfa?text=Git+Aliases"
comparison:
  before: "https://placehold.co/800x500/1c1c1f/71717a?text=Before:+Long+Commands"
  after: "https://placehold.co/800x500/0a0a0a/a78bfa?text=After:+Short+Aliases"
description: "Aliases de Git para comandos más rápidos y productivos en el día a día"
---

## Git Aliases Productivity

Configura aliases en Git para ejecutar comandos comunes más rápido.

### Configuración

```bash
# Agregar aliases globalmente
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --decorate"
git config --global alias.last "log -1 HEAD"
git config --global alias.unstage "reset HEAD --"
```

### Aliases Útiles

```bash
# Ver estado con estilo
git config --global alias.ss "status -sb"

# Commitear con mensaje
git config --global alias.cm '!git commit -m'

# Push rápido
git config --global alias.p '!git push'

# Pull con rebase
git config --global alias.pull '!git pull --rebase'

# Ver historial bonito
git config --global alias.hist "log --pretty=format:'%h %s' --graph"

# Eliminar ramas merged
git config --global alias.cleanup '!git branch --merged | grep -v "\\*\\|main\\|master" | xargs -n 1 git branch -d'
```

### Tips

1. Usa `!` al inicio para comandos shell
2. Los aliases se guardan en `~/.gitconfig`
3. Comparte tus aliases con el equipo usando un archivo `.gitconfig` compartido
