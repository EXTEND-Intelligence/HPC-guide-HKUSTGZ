type SearchEntry = { title: string; description: string; group: string; href: string; keywords: string; text: string };

const searchDialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]')!;
const searchInput = document.querySelector<HTMLInputElement>('#site-search')!;
const searchResults = document.querySelector<HTMLUListElement>('[data-search-results]')!;
const searchStatus = document.querySelector<HTMLElement>('[data-search-status]')!;
const navigationDialog = document.querySelector<HTMLDialogElement>('[data-nav-dialog]')!;
const themeButton = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')!;
let searchIndex: Promise<SearchEntry[]> | undefined;
let activeResult = -1;
let searchRevision = 0;

function setThemeLabel() {
  themeButton.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '切换为浅色主题' : '切换为深色主题');
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#0b0b0b' : '#f7f9f7');
  document.querySelector<HTMLLinkElement>('[data-site-favicon]')?.setAttribute('href', document.documentElement.dataset.theme === 'dark' ? '/favicon-dark.svg' : '/favicon.svg');
}
setThemeLabel();
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('hpc-theme', theme); } catch { /* Storage may be disabled. */ }
  setThemeLabel();
});

document.querySelector<HTMLButtonElement>('[data-nav-open]')?.addEventListener('click', () => navigationDialog.showModal());
document.querySelector<HTMLButtonElement>('[data-nav-close]')?.addEventListener('click', () => navigationDialog.close());
for (const dialog of [searchDialog, navigationDialog]) {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}

function loadIndex() {
  if (!searchIndex) searchIndex = fetch('/search.json').then((response) => {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.json() as Promise<SearchEntry[]>;
  }).catch((error) => { searchIndex = undefined; throw error; });
  return searchIndex;
}

function appendHighlighted(element: HTMLElement, value: string, query: string) {
  const index = query ? value.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index < 0) { element.textContent = value; return; }
  element.append(document.createTextNode(value.slice(0, index)));
  const mark = document.createElement('mark');
  mark.textContent = value.slice(index, index + query.length);
  element.append(mark, document.createTextNode(value.slice(index + query.length)));
}

function resultSnippet(entry: SearchEntry, query: string) {
  const index = entry.text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || index < 0) return entry.description;
  const start = Math.max(0, index - 26);
  const end = Math.min(entry.text.length, index + query.length + 62);
  return `${start ? '…' : ''}${entry.text.slice(start, end)}${end < entry.text.length ? '…' : ''}`;
}

async function renderResults() {
  const revision = ++searchRevision;
  const query = searchInput.value.trim();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  searchStatus.textContent = '正在加载搜索索引…';
  try {
    const entries = await loadIndex();
    if (revision !== searchRevision) return;
    const ranked = entries.map((entry) => {
      const title = entry.title.toLowerCase();
      const keywords = entry.keywords.toLowerCase();
      const all = `${title} ${keywords} ${entry.description} ${entry.text}`.toLowerCase();
      const score = words.every((word) => all.includes(word)) ? words.reduce((sum, word) => sum + (title.includes(word) ? 30 : keywords.includes(word) ? 15 : 3), 0) + 1 : 0;
      return { entry, score };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
    searchResults.replaceChildren();
    activeResult = -1;
    for (const { entry } of ranked) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = entry.href;
      const group = document.createElement('span');
      group.className = 'search-result-group'; group.textContent = entry.group;
      const title = document.createElement('span'); title.className = 'search-result-title';
      const snippet = document.createElement('span'); snippet.className = 'search-result-snippet';
      appendHighlighted(title, entry.title, query);
      appendHighlighted(snippet, resultSnippet(entry, query), query);
      link.append(group, title, snippet); item.append(link); searchResults.append(item);
    }
    searchStatus.textContent = !query ? '输入命令、节点、费用等关键词。' : ranked.length ? `找到 ${ranked.length} 个匹配页面${ranked.length === 10 ? '（最多展示 10 项）' : ''}。` : '没有找到匹配内容，试试 sbatch、debug、费用或 SSH。';
  } catch {
    if (revision === searchRevision) {
      searchResults.replaceChildren();
      searchStatus.textContent = '搜索索引暂不可用。请从侧栏浏览文档，或稍后重试。';
    }
  }
}

function openSearch() {
  if (!searchDialog.open) searchDialog.showModal();
  searchInput.focus();
  void renderResults();
}
document.querySelector<HTMLButtonElement>('[data-search-open]')?.addEventListener('click', openSearch);
document.querySelector<HTMLButtonElement>('[data-search-close]')?.addEventListener('click', () => searchDialog.close());
document.querySelector<HTMLElement>('[data-search-shortcut]')!.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (navigationDialog.open) navigationDialog.close();
    openSearch();
  }
});
searchInput.addEventListener('input', () => { void renderResults(); });
searchInput.addEventListener('keydown', (event) => {
  const links = [...searchResults.querySelectorAll<HTMLAnchorElement>('.search-result')];
  if (!links.length) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    activeResult = (activeResult + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
    links.forEach((link, index) => link.classList.toggle('active', index === activeResult));
    links[activeResult]?.scrollIntoView({ block: 'nearest' });
  } else if (event.key === 'Enter') {
    event.preventDefault();
    links[Math.max(0, activeResult)]?.click();
  }
});

async function copyText(value: string) {
  if (!navigator.clipboard) throw new Error('Use HTTPS or localhost for clipboard access');
  await navigator.clipboard.writeText(value);
}

const copyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M9 9h11v11H9z M15 9V4H4v11h5" /></svg>';
const checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12l4 4L19 6" /></svg>';
const announcement = document.querySelector<HTMLElement>('[data-copy-status]')!;
document.querySelectorAll<HTMLPreElement>('.prose pre').forEach((pre, index) => {
  const code = pre.querySelector('code');
  if (!code) return;
  const wrapper = document.createElement('div'); wrapper.className = 'code-block';
  pre.before(wrapper); wrapper.append(pre);
  const toolbar = document.createElement('div'); toolbar.className = 'code-toolbar';
  const label = document.createElement('span'); label.className = 'code-label';
  label.textContent = pre.closest('.source-code-section') ? 'SOURCE' : 'CODE';
  const button = document.createElement('button'); button.type = 'button'; button.className = 'copy-button';
  button.innerHTML = `${copyIcon}<span>复制</span>`;
  button.setAttribute('aria-label', `复制第 ${index + 1} 个代码块`);
  // A location label rendered right before the block becomes its header.
  const location = wrapper.previousElementSibling;
  toolbar.append(location?.classList.contains('code-location') ? location : label, button);
  wrapper.prepend(toolbar);
  let resetTimer: ReturnType<typeof setTimeout>;
  button.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    try {
      await copyText(code.textContent || '');
      button.innerHTML = `${checkIcon}<span>已复制</span>`;
      button.dataset.copied = 'true'; announcement.textContent = '代码已复制到剪贴板。';
    } catch {
      const range = document.createRange(); range.selectNodeContents(code);
      const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
      button.innerHTML = `${copyIcon}<span>请手动复制</span>`;
      announcement.textContent = '浏览器未允许复制，请选择代码手动复制。';
    }
    resetTimer = setTimeout(() => { button.innerHTML = `${copyIcon}<span>复制</span>`; delete button.dataset.copied; }, 2200);
  });
});

document.querySelectorAll<HTMLTableElement>('.prose table').forEach((table) => {
  const wrapper = document.createElement('div'); wrapper.className = 'table-scroll'; wrapper.tabIndex = 0;
  wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-label', '表格，可横向滚动');
  table.before(wrapper); wrapper.append(table);
});

const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      tocLinks.forEach((link) => link.classList.toggle('active', decodeURIComponent(link.hash.slice(1)) === entry.target.id));
    }
  }, { rootMargin: '-90px 0px -65% 0px', threshold: 0 });
  tocLinks.forEach((link) => { const heading = document.getElementById(decodeURIComponent(link.hash.slice(1))); if (heading) observer.observe(heading); });
}
