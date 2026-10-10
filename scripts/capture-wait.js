// Helper for scripts/capture-comparisons.mjs — executed via `playwright-cli run-code`.
// Must stay a single function expression (no import/export/require).
async page => {
  try {
    await page.evaluate(() =>
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 8000))]),
    );
  } catch {}
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? null
          : new Promise((res) => {
              img.addEventListener('load', res, { once: true });
              img.addEventListener('error', res, { once: true });
              setTimeout(res, 10000);
            }),
      ),
    ),
  );
  // Let the Tailwind CDN JIT + layout settle.
  await page.waitForTimeout(1500);
  return 'ready';
}
