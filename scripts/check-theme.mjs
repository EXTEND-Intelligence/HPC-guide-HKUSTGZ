import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../src/styles/site.css', import.meta.url), 'utf8');
const dark = css.match(/:root\[data-theme='dark'\]\s*\{([^}]+)\}/)?.[1];
assert(dark, 'Missing dark theme');
const tokens = Object.fromEntries([...dark.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));

// UI colors must stay achromatic; syntax-highlighting colors are independent.
for (const [name, value] of Object.entries(tokens)) {
  const colors = [...value.matchAll(/#([\da-f]{6})([\da-f]{2})?\b/gi)];
  assert(colors.length, `Missing hexadecimal color: ${name}`);
  for (const [, hex] of colors) {
    assert(hex.slice(0, 2) === hex.slice(2, 4) && hex.slice(2, 4) === hex.slice(4, 6), `Non-neutral dark color: ${name} = ${value}`);
  }
}
assert.equal(tokens['--bg'], '#0b0b0b', 'Keep the requested near-black canvas');

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((value) => {
    const channel = parseInt(value, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

const pairs = [
  ['--text', '--bg'], ['--muted', '--surface'], ['--faint', '--surface-soft'],
  ['--accent', '--accent-soft'], ['--primary-text', '--primary-bg'],
  ['--brand-text', '--brand-bg'], ['--terminal-text', '--terminal-bg'],
  ['--terminal-comment', '--terminal-bg'], ['--terminal-bar-text', '--terminal-bar-bg'],
];
for (const [foreground, background] of pairs) {
  const a = luminance(tokens[foreground]);
  const b = luminance(tokens[background]);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  assert(ratio >= 4.5, `Insufficient text contrast (${ratio.toFixed(2)}): ${foreground} on ${background}`);
}
console.log(`Theme verified: ${Object.keys(tokens).length} neutral dark tokens; ${pairs.length} text pairs meet WCAG AA contrast.`);
