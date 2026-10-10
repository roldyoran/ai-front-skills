import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Shared handler for full demo page endpoints
 * (src/pages/demos/<skill>/<source>/{before,after}.html.ts).
 *
 * Serves demos/ HTML verbatim as text/html. Static dotted endpoints are used
 * (instead of public/*.html) because Astro dev hijacks .html requests that
 * accept text/html and returns its 404 page.
 */
export function demoResponse(skill: string, source: string, side: 'before' | 'after'): Response {
  let html: string;
  try {
    html = readFileSync(join(process.cwd(), 'demos', skill, source, `${side}.html`), 'utf-8');
  } catch {
    return new Response('Not found', { status: 404 });
  }
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
