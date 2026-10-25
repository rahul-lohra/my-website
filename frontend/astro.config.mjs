import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import links from './rehype-links.mjs';
import sitemap from '@astrojs/sitemap';
export default defineConfig({ site: process.env.SITE_URL || 'https://rahullohra.com', base: process.env.BASE_PATH || '/', output: 'static', trailingSlash: 'always', integrations: [react(), sitemap()], markdown: { processor: unified({ rehypePlugins: [links] }), shikiConfig: { theme: 'github-dark' } } });
