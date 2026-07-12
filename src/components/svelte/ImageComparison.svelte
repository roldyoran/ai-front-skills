<script lang="ts">
  import { onDestroy } from 'svelte';

  let {
    beforeSrc,
    afterSrc,
    beforeAlt = 'Before',
    afterAlt = 'After',
    width = 800,
    height = 500
  } = $props<{
    beforeSrc: string;
    afterSrc: string;
    beforeAlt?: string;
    afterAlt?: string;
    width?: number;
    height?: number;
  }>();

  let sliderPosition = $state(50);
  let isDragging = $state(false);
  let containerEl = $state<HTMLDivElement | null>(null);

  function handleMove(clientX: number) {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const x = clientX - rect.left;
    sliderPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
  }

  function handleMouseDown(e: MouseEvent | TouchEvent) {
    isDragging = true;
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    handleMove(e.clientX);
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }

  // Manage document listeners with $effect in Svelte 5
  $effect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    }
  });
</script>

<div
  bind:this={containerEl}
  class="relative w-full overflow-hidden border border-border cursor-col-resize select-none"
  style="aspect-ratio: {width}/{height};"
  onmousedown={handleMouseDown}
  ontouchstart={handleMouseDown}
  role="presentation"
>
  <!-- After Image (Background) -->
  <img
    src={afterSrc}
    alt={afterAlt}
    class="absolute inset-0 h-full w-full object-cover"
    draggable="false"
  />

  <!-- Before Image (Clipped) -->
  <div
    class="absolute inset-0 h-full overflow-hidden"
    style="width: {sliderPosition}%;"
  >
    <img
      src={beforeSrc}
      alt={beforeAlt}
      class="h-full w-full object-cover"
      style="width: {(100 / sliderPosition) * 100}%; max-width: none;"
      draggable="false"
    />
  </div>

  <!-- Slider Line -->
  <div
    class="absolute top-0 h-full w-0.5 bg-text"
    style="left: {sliderPosition}%; transform: translateX(-50%);"
  >
    <!-- Slider Handle -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border-2 border-text bg-bg/80 backdrop-blur-sm">
      <svg
        class="h-5 w-5 text-text"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width={2}
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    </div>
  </div>

  <!-- Labels -->
  <div class="absolute left-4 top-4 bg-bg/80 px-2 py-1 text-xs text-text-muted backdrop-blur-sm border border-border">
    Before
  </div>
  <div class="absolute right-4 top-4 bg-bg/80 px-2 py-1 text-xs text-text-muted backdrop-blur-sm border border-border">
    After
  </div>
</div>
