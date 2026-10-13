import type { APIRoute } from 'astro';
import { documents, resources } from '../../data/catalog.mjs';
import { readSource } from '../../lib/content';

export function getStaticPaths() {
  return [...documents, ...resources].map((item) => ({
    params: { file: item.source }, props: { source: item.source },
  }));
}

export const GET: APIRoute = ({ props }) => new Response(readSource(props.source), {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Disposition': `attachment; filename="${props.source.split('/').pop()}"`,
    'X-Content-Type-Options': 'nosniff',
  },
});
