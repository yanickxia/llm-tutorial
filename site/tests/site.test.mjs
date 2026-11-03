import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { createMarkdownRenderer } from 'vitepress';
import { pagesBase, resolveSourceLink } from '../scripts/paths.mjs';
import { repoRoot, siteRoot } from '../scripts/sync-content.mjs';

const dist = path.join(siteRoot, 'dist');
const base = pagesBase();
const course = JSON.parse(await readFile(path.join(siteRoot, 'content/course.json'), 'utf8'));

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(full) : entry.name.endsWith('.html') ? [full] : [];
  }));
  return files.flat();
}

test('every rendered page has working local links and assets under the deployment base', async () => {
  const files = await htmlFiles(dist);
  assert.ok(files.length >= course.lessons.length + 5);
  assert.ok(files.every((file) => !path.relative(dist, file).startsWith('public/')),
    'downloadable Markdown templates must not become searchable course pages');
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const current = new URL(`${base}${path.relative(dist, file)}`, 'https://course.example');
    for (const [, attribute] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const href = attribute.replaceAll('&amp;', '&');
      const url = new URL(href, current);
      if (url.origin !== current.origin) continue;
      assert.ok(url.pathname.startsWith(base), `${file}: link escapes deployment base: ${href}`);
      const relative = decodeURIComponent(url.pathname.slice(base.length));
      let destination = path.join(dist, relative);
      if (url.pathname.endsWith('/')) destination = path.join(destination, 'index.html');
      assert.ok((await stat(destination)).isFile(), `${file}: missing target: ${href}`);
      if (url.hash && destination.endsWith('.html')) {
        const target = await readFile(destination, 'utf8');
        const anchor = decodeURIComponent(url.hash.slice(1));
        assert.ok(target.includes(`id="${anchor}"`), `${file}: missing anchor: ${href}`);
      }
    }
  }
});

test('course and learning notes are generated from the canonical Markdown', async () => {
  for (const [generated, source] of Object.entries(course.sources)) {
    if (source.endsWith('/README.md') && source.startsWith('notes/') && source !== 'notes/README.md') continue;
    const original = await readFile(path.join(repoRoot, source), 'utf8');
    assert.equal(await readFile(path.join(siteRoot, 'content', generated), 'utf8'), original);
  }
  const home = await readFile(path.join(dist, 'index.html'), 'utf8');
  assert.ok(home.includes('从第一个预测'));
  assert.ok(home.includes(course.lessons[0].title));
  assert.ok(home.includes('路线规划'));
  const lesson = await readFile(path.join(dist, course.lessons[0].url), 'utf8');
  assert.ok(lesson.includes('实验前预测'));
  assert.ok(lesson.includes('language-python'));
  assert.ok(lesson.includes(`${base}source/labs/lesson_00/reproducibility.py`));
});

test('relative links preserve Chinese paths, anchors and downloadable source', () => {
  assert.equal(resolveSourceLink('../notes/01-基础与实验环境/note-00.md#预测修订',
    'docs/lesson-00.md', course, '/llm-tutorial/'),
  '/llm-tutorial/notes/01-基础与实验环境/note-00.html#预测修订');
  assert.equal(resolveSourceLink('01-%E5%9F%BA%E7%A1%80%E4%B8%8E%E5%AE%9E%E9%AA%8C%E7%8E%AF%E5%A2%83/',
    'notes/README.md', course), '/notes/01-基础与实验环境/');
  assert.throws(() => resolveSourceLink('../../.env', 'docs/lesson-00.md', course), /Unmapped/);
});

test('inline and block mathematical formulas render without a hosted math service', async () => {
  const renderer = await createMarkdownRenderer(siteRoot, { math: true });
  const html = renderer.render('概率 $p(x)$\n\n$$\nL = -\\log p(x)\n$$\n');
  assert.equal((html.match(/<mjx-container/g) ?? []).length, 2);
});
