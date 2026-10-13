import type { MarkdownInstance } from 'astro';
import { documents, resources } from '../data/catalog.mjs';

type MarkdownModule = MarkdownInstance<Record<string, unknown>>;
const markdown = {
  ...import.meta.glob<MarkdownModule>('../../README.md', { eager: true }),
  ...import.meta.glob<MarkdownModule>('../../QUICKSTART.md', { eager: true }),
  ...import.meta.glob<MarkdownModule>('../../docs/*.md', { eager: true }),
  ...import.meta.glob<MarkdownModule>('../../examples/README.md', { eager: true }),
  ...import.meta.glob<MarkdownModule>('../../templates/*.md', { eager: true }),
  ...import.meta.glob<MarkdownModule>('../../references/*.md', { eager: true }),
};
// Import as raw text at build time, not via runtime filesystem paths: Astro
// prerenders from generated chunks whose locations differ from src/.
const rawSources = {
  ...import.meta.glob<string>('../../{README,QUICKSTART}.md', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('../../docs/*.md', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('../../examples/*.{md,py,txt}', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('../../slurm/*.sbatch', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('../../templates/*.{md,example}', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('../../references/*.md', { eager: true, query: '?raw', import: 'default' }),
};

export function getDocument(source: string): MarkdownModule {
  const document = markdown[`../../${source}`];
  if (!document) throw new Error(`Missing Markdown source: ${source}`);
  return document;
}

export function readSource(source: string): string {
  const allowed = [...documents, ...resources].some((item) => item.source === source);
  if (!allowed) throw new Error(`Source is not in the public tutorial catalog: ${source}`);
  const text = rawSources[`../../${source}`];
  if (text === undefined) throw new Error(`Missing public source: ${source}`);
  return text;
}

export function plainText(markdown: string): string {
  return markdown
    .replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, '')
    .replace(/```[^\n]*\n/g, '')
    .replace(/```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*|>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
