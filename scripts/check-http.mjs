import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { documents, resources, documentHref, resourceHref } from '../src/data/catalog.mjs';

const base = new URL(process.argv[2] || 'http://127.0.0.1:4321/');
const root = new URL('../', import.meta.url);
const pages = ['/', '/scripts/', ...documents.map(documentHref), ...resources.map(resourceHref)];
const files = [...documents, ...resources];

async function get(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, `HTTP ${response.status}: ${path}`);
  return response;
}

for (const page of pages) {
  const response = await get(page);
  assert((response.headers.get('content-type') || '').includes('text/html'), `Not HTML: ${page}`);
  assert((await response.text()).includes('HPC Guide'), `Unexpected page: ${page}`);
}
for (const file of files) {
  const response = await get(`/downloads/${file.source}`);
  const data = Buffer.from(await response.arrayBuffer());
  assert.deepEqual(data, await readFile(fileURLToPath(new URL(file.source, root))), `Download differs: ${file.source}`);
}
const search = await (await get('/search.json')).json();
assert.equal(search.length, files.length);
await get('/favicon.svg');
console.log(`HTTP verified at ${base.origin}: ${pages.length} pages, ${files.length} exact-source downloads, search index and favicon.`);
