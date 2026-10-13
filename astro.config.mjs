import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remapLinks from './plugins/remap-links.mjs';

export default defineConfig({
  output: 'static',
  // HTML pages use directory URLs, but downloadable files must keep their
  // actual extensions. "always" makes these endpoints return 404 in dev.
  trailingSlash: 'ignore',
  markdown: {
    processor: unified({ remarkPlugins: [remapLinks] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: false,
    },
  },
});
