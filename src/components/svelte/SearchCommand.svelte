<script lang="ts">
  interface SkillResult {
    title: string;
    slug: string;
    description: string;
    topics: string[];
  }

  interface SearchLabels {
    trigger: string;
    placeholder: string;
    noResults: string;
    navigate: string;
    select: string;
    close: string;
    results: string;
  }

  let {
    skills,
    locale = 'en',
    labels
  } = $props<{
    skills: SkillResult[];
    locale?: string;
    labels: SearchLabels;
  }>();

  let isOpen = $state(false);
  let query = $state('');
  let activeIndex = $state(0);

  let inputEl = $state<HTMLInputElement | null>(null);
  let resultsEl = $state<HTMLDivElement | null>(null);

  let results = $derived(
    query.trim()
      ? skills.filter((s) => {
          const q = query.toLowerCase();
          return (
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.topics.some((t) => t.toLowerCase().includes(q))
          );
        })
      : skills.slice(0, 6)
  );

  function close() {
    isOpen = false;
    query = '';
    activeIndex = 0;
  }

  function handleSelect(slug: string) {
    const prefix = locale === 'es' ? '/es' : '';
    window.location.href = `${prefix}/skills/${slug}`;
    close();
  }

  function handleWindowKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isOpen = !isOpen;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, results.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[activeIndex]) {
          handleSelect(results[activeIndex].slug);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  }

  // Focus input when opened
  $effect(() => {
    if (isOpen && inputEl) {
      const id = requestAnimationFrame(() => inputEl?.focus());
      return () => cancelAnimationFrame(id);
    }
  });

  // Reset active index when query changes
  $effect(() => {
    // read query to establish dependency
    const _ = query;
    activeIndex = 0;
  });

  // Scroll active item into view
  $effect(() => {
    if (resultsEl) {
      const activeEl = resultsEl.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  });

  // Prevent body scroll when modal is open
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  });

  const topicInitial = (skill: SkillResult) =>
    (skill.topics[0]?.charAt(0) ?? skill.title.charAt(0)).toUpperCase();
</script>

<svelte:window onkeydown={handleWindowKeyDown} />

<div class="relative">
  <!-- Trigger Button -->
  <button
    onclick={() => isOpen = true}
    class="flex items-center gap-3 border border-border bg-surface px-4 py-2 text-sm text-text-muted transition-colors hover:border-border-hover hover:text-text-secondary cursor-pointer"
  >
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
      <path stroke-linecap="square" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <span>{labels.trigger}</span>
    <kbd class="ml-8 flex items-center gap-1 border border-border bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-muted">
      <span>⌘</span>
      <span>K</span>
    </kbd>
  </button>

  <!-- Modal -->
  {#if isOpen}
    <!-- Backdrop -->
    <!-- svelte:click-events-have-key-events and a11y warnings handled by close function -->
    <div
      class="search-backdrop"
      onclick={close}
      onkeydown={close}
      role="button"
      tabindex="-1"
      aria-label="Close search"
    ></div>

    <!-- Search Modal -->
    <div
      class="search-modal"
      role="dialog"
      aria-label="Search skills"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && close()}
    >
      <!-- Input -->
      <div class="search-input-wrapper">
        <svg class="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
          <path stroke-linecap="square" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          bind:this={inputEl}
          type="text"
          bind:value={query}
          onkeydown={handleKeyDown}
          placeholder={labels.placeholder}
          class="search-input"
          autocomplete="off"
          spellcheck={false}
        />
        <kbd class="search-kbd">ESC</kbd>
      </div>

      <!-- Results -->
      <div class="search-results" bind:this={resultsEl}>
        {#if results.length === 0}
          <div class="p-8 text-center text-sm text-text-muted">
            {labels.noResults} "{query}"
          </div>
        {:else}
          {#each results as skill, index}
            <a
              href="{locale === 'es' ? '/es' : ''}/skills/{skill.slug}"
              class="search-result-item {index === activeIndex ? 'active' : ''}"
              onclick={(e) => {
                e.preventDefault();
                handleSelect(skill.slug);
              }}
              onmouseenter={() => activeIndex = index}
            >
              <span class="search-result-icon flex items-center justify-center w-6 h-6 border border-border bg-bg-secondary text-[10px] font-bold text-text-muted">
                {topicInitial(skill)}
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{skill.title}</div>
                <div class="text-xs text-text-muted truncate">{skill.description}</div>
              </div>
              {#if skill.topics[0]}
                <span class="flex-shrink-0 text-[10px] text-text-muted uppercase tracking-wider border border-border px-1.5 py-0.5">
                  {skill.topics[0]}
                </span>
              {/if}
            </a>
          {/each}
        {/if}
      </div>

      <!-- Footer -->
      <div class="search-footer">
        <span class="flex items-center gap-1.5">
          <kbd class="search-kbd">↑</kbd>
          <kbd class="search-kbd">↓</kbd>
          <span>{labels.navigate}</span>
        </span>
        <span class="flex items-center gap-1.5">
          <kbd class="search-kbd">↵</kbd>
          <span>{labels.select}</span>
        </span>
        <span class="flex items-center gap-1.5">
          <kbd class="search-kbd">ESC</kbd>
          <span>{labels.close}</span>
        </span>
        <span class="ml-auto">{results.length} {labels.results}</span>
      </div>
    </div>
  {/if}
</div>
