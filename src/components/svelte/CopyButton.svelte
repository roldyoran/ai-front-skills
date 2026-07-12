<script lang="ts">
  let { text, label = 'Copy' } = $props<{
    text: string;
    label?: string;
  }>();

  let copied = $state(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
</script>

<button
  onclick={handleCopy}
  class="inline-flex items-center gap-1.5 border border-border bg-surface px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
  aria-label={copied ? 'Copied!' : label}
>
  {#if copied}
    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M5 13l4 4L19 7" />
    </svg>
    Copied!
  {:else}
    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
    {label}
  {/if}
</button>
