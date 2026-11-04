import { readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitepress';
import { pagesBase, resolveSourceLink } from '../scripts/paths.mjs';
import { repoRoot, sourceDirectories, syncContent } from '../scripts/sync-content.mjs';

const course = JSON.parse(readFileSync(new URL('../content/course.json', import.meta.url), 'utf8'));
const base = pagesBase();
const groups = [...new Set(course.lessons.map((lesson) => lesson.section))];
const sidebar = [
  { text: '学习入口', items: [
    { text: '课程路线图', link: '/docs/roadmap.html' },
    { text: '参考资料', link: '/docs/reference/' },
  ] },
  ...groups.map((group) => ({
    text: group.replace(/^\d+-/, ''),
    items: course.lessons.filter((lesson) => lesson.section === group).map((lesson) => ({
      text: `${lesson.id} · ${lesson.title}`, link: lesson.url,
      items: [{ text: '学习笔记', link: lesson.notesUrl }],
    })),
  })),
];

export default defineConfig({
  srcDir: 'content',
  srcExclude: ['public/**'],
  outDir: 'dist',
  base,
  lang: 'zh-CN',
  title: 'LLM Field Notes',
  description: '从零理解并实现语言模型，再走向 RAG 与 Agent。用实验连接原理和应用。',
  appearance: false,
  cleanUrls: false,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }]],
  markdown: {
    math: true,
    theme: { light: 'github-light', dark: 'github-dark' },
    config(md) {
      const renderLink = md.renderer.rules.link_open;
      md.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
        const source = course.sources[env.relativePath];
        const token = tokens[index];
        const href = token.attrGet('href');
        if (source && href) {
          const resolved = resolveSourceLink(href, source, course);
          if (resolved.startsWith('/source/')) {
            token.attrSet('href', `${base.replace(/\/$/, '')}${resolved}`);
            token.attrSet('download', '');
          } else {
            token.attrSet('href', resolved);
          }
        }
        return renderLink(tokens, index, options, env, renderer);
      };
    },
  },
  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: 'LLM Field Notes',
    socialLinks: [{ icon: 'github', link: 'https://github.com/yanickxia/llm-tutorial' }],
    nav: [
      { text: '教程', link: course.lessons[0].url, activeMatch: '/docs/lesson-' },
      { text: '路线图', link: '/docs/roadmap.html' },
      { text: '学习笔记', link: '/notes/', activeMatch: '/notes/' },
      { text: '参考资料', link: '/docs/reference/' },
    ],
    sidebar,
    outline: { level: [2, 3], label: '本页内容' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '课程目录',
    darkModeSwitchLabel: '主题',
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize(text) {
              return [...new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text)]
                .filter((part) => part.isWordLike).map((part) => part.segment);
            },
          },
        },
        locales: { root: { translations: {
          button: { buttonText: '搜索课程', buttonAriaLabel: '搜索课程' },
          modal: {
            displayDetails: '显示详细结果', resetButtonTitle: '清空搜索',
            backButtonTitle: '返回', noResultsText: '没有找到相关内容',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        } } },
      },
    },
    footer: {
      message: '先理解，再实现；每个结论，都留下一条可重复的证据。',
      copyright: 'LLM Tutorial · 从模型原理到真实应用',
    },
  },
  vite: {
    plugins: [{
      name: 'watch-course-markdown',
      configureServer(server) {
        const roots = sourceDirectories.map((directory) => `${path.join(repoRoot, directory)}${path.sep}`);
        server.watcher.add(roots);
        let timer;
        const onChange = (event, file) => {
          if (!['add', 'change', 'unlink'].includes(event) || !file.endsWith('.md') ||
              !roots.some((root) => file.startsWith(root))) return;
          clearTimeout(timer);
          timer = setTimeout(async () => {
            try {
              const { metadataChanged } = await syncContent();
              if (metadataChanged) await server.restart();
            } catch (error) {
              server.config.logger.error(error.stack);
            }
          }, 100);
        };
        server.watcher.on('all', onChange);
        server.httpServer?.once('close', () => {
          clearTimeout(timer);
          server.watcher.off('all', onChange);
        });
      },
    }],
  },
});
