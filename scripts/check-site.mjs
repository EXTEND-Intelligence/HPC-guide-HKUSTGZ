import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documents, resources, documentHref, resourceHref } from '../src/data/catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');

async function filesUnder(directory) {
  const items = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(items.map((item) => item.isDirectory() ? filesUnder(path.join(directory, item.name)) : [path.join(directory, item.name)]));
  return nested.flat();
}

const files = await filesUnder(dist);
const pages = files.filter((file) => file.endsWith('.html'));
const sourceItems = [...documents, ...resources];
for (const item of sourceItems) {
  const output = path.join(dist, 'downloads', item.source);
  assert.equal(await readFile(output, 'utf8'), await readFile(path.join(root, item.source), 'utf8'), `Download differs from source: ${item.source}`);
}
const search = JSON.parse(await readFile(path.join(dist, 'search.json'), 'utf8'));
assert.equal(search.length, sourceItems.length);
assert.equal(new Set(search.map((entry) => entry.href)).size, search.length);

for (const href of [...documents.map(documentHref), ...resources.map(resourceHref), '/', '/scripts/']) {
  assert((await stat(path.join(dist, href, 'index.html'))).isFile(), `Missing page: ${href}`);
}
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  assert(html.includes('lang="zh-CN"'), `Missing page language: ${file}`);
  assert(!/href="(?!\/|[a-z][\w+.-]*:|#)[^\"]*\.md(?:[#?\"])/i.test(html), `Unmapped Markdown link: ${file}`);
  for (const [, raw] of html.matchAll(/(?:href|src)="(\/[^\"]*)"/g)) {
    const pathname = decodeURIComponent(raw.split(/[?#]/)[0]);
    if (!pathname) continue;
    const target = path.join(dist, pathname, pathname.endsWith('/') ? 'index.html' : '');
    assert((await stat(target)).isFile(), `Broken local link: ${path.relative(dist, file)} -> ${pathname}`);
  }
}
console.log(`Site verified: ${pages.length} HTML pages, ${sourceItems.length} exact-source downloads, ${search.length} searchable entries; all internal links resolve.`);
