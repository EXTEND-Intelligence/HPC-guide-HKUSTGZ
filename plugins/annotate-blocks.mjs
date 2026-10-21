import { visit } from 'unist-util-visit';

// The Markdown keeps plain conventions that read well on GitHub
// (see AGENTS.md); only the rendered website turns them into styled blocks.
const LOCATIONS = { 本机: 'local', 登录节点: 'login', 计算节点: 'compute', 文件: 'file' };
const LOCATION_LABEL = /^(本机|登录节点|计算节点|文件)(?:（(.+)）)?：$/;
const CALLOUTS = { '注意：': 'warning', '提示：': 'tip' };

function soleText(strong) {
  return strong?.type === 'strong' && strong.children.length === 1 && strong.children[0].type === 'text'
    ? strong.children[0].value : undefined;
}

// "**本机（macOS / Linux）：**" renders as a "本机 · macOS / Linux" chip.
function toChip(strong) {
  const match = soleText(strong)?.match(LOCATION_LABEL);
  if (!match) return undefined;
  strong.children[0].value = match[2] ? `${match[1]} · ${match[2]}` : match[1];
  strong.data = { ...strong.data, hProperties: { className: ['location-chip'], dataLocation: LOCATIONS[match[1]] } };
  return LOCATIONS[match[1]];
}

export default function annotateBlocks() {
  return (tree) => {
    // A label paragraph directly before a code block becomes that block's header.
    visit(tree, 'paragraph', (node, index, parent) => {
      const [strong, ...note] = node.children;
      if (!parent || index === undefined || parent.children[index + 1]?.type !== 'code') return;
      const location = toChip(strong);
      if (!location) return;
      if (note[0]?.type === 'text') note[0] = { ...note[0], value: note[0].value.trimStart() };
      const hasNote = note.some((child) => child.type !== 'text' || child.value);
      node.children = hasNote
        ? [strong, { type: 'emphasis', data: { hName: 'span', hProperties: { className: ['location-note'] } }, children: note }]
        : [strong];
      node.data = { ...node.data, hProperties: { className: ['code-location'], dataLocation: location } };
    });
    // Labels mentioned inside running text use the same chip.
    visit(tree, 'strong', (node) => {
      if (!node.data?.hProperties?.className?.includes('location-chip')) toChip(node);
    });
    // "> **注意：** …" and "> **提示：** …" become typed callouts.
    visit(tree, 'blockquote', (node) => {
      const [first] = node.children[0]?.type === 'paragraph' ? node.children[0].children : [];
      const kind = CALLOUTS[soleText(first)];
      if (kind) node.data = { ...node.data, hProperties: { className: ['callout', `callout-${kind}`] } };
    });
  };
}
