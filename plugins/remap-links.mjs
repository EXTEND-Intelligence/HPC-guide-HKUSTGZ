import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visit } from 'unist-util-visit';
import { sourceRoutes } from '../src/data/catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

// Preserve the original Markdown links for terminal/Git readers;
// only transform relative links when Astro renders them for the website.
export default function remapLinks() {
  return (tree, file) => {
    visit(tree, 'code', (node) => {
      if (node.lang === 'sshconfig') node.lang = 'ssh-config';
    });
    if (!file.path) return;
    visit(tree, 'link', (node) => {
      if (!node.url || /^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(node.url)) return;
      const [, filePart, suffix] = node.url.match(/^([^?#]*)(.*)$/s);
      const absolute = path.resolve(path.dirname(file.path), decodeURIComponent(filePart));
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      const route = sourceRoutes.get(relative);
      if (!route) throw new Error(`Unmapped tutorial link: ${file.path} -> ${node.url}`);
      node.url = `${route}${suffix}`;
    });
  };
}
