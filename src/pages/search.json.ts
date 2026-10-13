import type { APIRoute } from 'astro';
import { documents, resources, documentHref, resourceHref } from '../data/catalog.mjs';
import { plainText, readSource } from '../lib/content';

export const GET: APIRoute = () => {
  const entries = [
    ...documents.map((document) => ({
      title: document.title, description: document.description, group: document.group,
      href: documentHref(document), keywords: document.keywords, text: plainText(readSource(document.source)),
    })),
    ...resources.map((resource) => ({
      title: resource.title, description: resource.description, group: resource.group,
      href: resourceHref(resource), keywords: resource.source, text: plainText(readSource(resource.source)),
    })),
  ];
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
