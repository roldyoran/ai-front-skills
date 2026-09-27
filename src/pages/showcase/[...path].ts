import comparisonsData from '@/data/comparisons.json';
import { demoResponse } from '@/lib/demoEndpoint';

/**
 * Full demo pages: /showcase/<skill>/<source>/{before,after}.html
 *
 * Single catch-all route (a `[side].html.ts` param file does not resolve in
 * Astro, so the .html suffix is matched inside the rest param instead).
 * Reads the self-contained HTML from demos/ at build time and serves it
 * verbatim. New sources work automatically — just add the manifest entry
 * and the demos/<skill>/<source>/{before,after}.html files.
 */
export function getStaticPaths() {
  const cases = (comparisonsData as { cases?: { skill: string; source?: string; id: string }[] }).cases ?? [];
  const seen = new Set<string>();
  const paths: { params: Record<string, string> }[] = [];
  for (const c of cases) {
    const source = c.source ?? c.id;
    const key = `${c.skill}/${source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const side of ['before', 'after']) {
      paths.push({ params: { path: `${key}/${side}.html` } });
    }
  }
  return paths;
}

export function GET({ params }: { params: { path?: string } }) {
  const match = params.path?.match(/^([^/]+)\/([^/]+)\/(before|after)\.html$/);
  if (!match) {
    return new Response('Not found', { status: 404 });
  }
  const [, skill, source, side] = match;
  return demoResponse(skill, source, side as 'before' | 'after');
}
