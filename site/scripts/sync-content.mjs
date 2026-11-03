import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pagePath, pageUrl } from './paths.mjs';

export const siteRoot = fileURLToPath(new URL('..', import.meta.url));
export const repoRoot = path.resolve(siteRoot, '..');
export const sourceDirectories = ['docs', 'notes', 'labs', 'data'];

async function filesUnder(directory) {
  const entries = await readdir(path.join(repoRoot, directory), { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const relative = `${directory}/${entry.name}`;
    if (entry.name.startsWith('.') || entry.name === '__pycache__' ||
        relative === 'data/raw' || relative === 'data/processed') return [];
    return entry.isDirectory() ? filesUnder(relative) : entry.isFile() ? [relative] : [];
  }));
  return files.flat().sort();
}

export async function syncContent() {
  const output = path.join(siteRoot, 'content');
  const files = (await Promise.all(sourceDirectories.map(filesUnder))).flat();
  const pages = files.filter((file) => file.endsWith('.md') && !file.startsWith('docs/templates/') &&
    !file.startsWith('data/raw/') && !file.startsWith('data/processed/'));
  const downloads = files.filter((file) => file.startsWith('docs/templates/') && file.endsWith('.md') ||
    file.startsWith('labs/') && file.endsWith('.py'));
  const course = { lessons: [], stages: [], routes: {}, sources: {}, downloads: {} };
  const documents = new Map();

  for (const file of pages) {
    documents.set(file, await readFile(path.join(repoRoot, file), 'utf8'));
    course.routes[file] = pageUrl(file);
    course.sources[pagePath(file)] = file;
  }
  for (const file of downloads) course.downloads[file] = `/source/${file}`;

  for (const [file, markdown] of documents) {
    const match = file.match(/^docs\/lesson-(\d+(?:\.\d+)?)\.md$/);
    if (!match) continue;
    const id = match[1];
    const notes = pages.filter((candidate) => candidate.endsWith(`/note-${id}.md`));
    if (notes.length !== 1) throw new Error(`${file} must have exactly one matching learning note`);
    const title = markdown.match(/^# (.+)$/m)?.[1];
    if (!title) throw new Error(`${file} has no course title`);
    const summary = markdown.match(/^## 本章建立的完整能力\s*\n+([^\n]+(?:\n(?!\n)[^\n]+)*)/m)?.[1]
      .replace(/\n/g, '').replace(/[*`]/g, '') ?? '';
    course.lessons.push({
      id, title: title.replace(/^第\s*\d+(?:\.\d+)?\s*课[：:]\s*/, ''),
      summary, url: course.routes[file], notesUrl: course.routes[notes[0]],
      section: notes[0].split('/')[1],
    });
  }
  course.lessons.sort((left, right) => Number(left.id) - Number(right.id));
  if (!course.lessons.length) throw new Error('No course lessons found');

  for (const section of new Set(course.lessons.map((lesson) => lesson.section))) {
    const source = `notes/${section}/README.md`;
    if (documents.has(source)) continue;
    const lessons = course.lessons.filter((lesson) => lesson.section === section);
    documents.set(source, `# ${section.replace(/^\d+-/, '')}：学习记录\n\n` +
      lessons.map((lesson) => `- [第 ${Number(lesson.id)} 课：${lesson.title}](note-${lesson.id}.md)`).join('\n') + '\n');
    course.routes[source] = pageUrl(source);
    course.sources[pagePath(source)] = source;
  }

  const roadmap = documents.get('docs/roadmap.md');
  for (const line of roadmap.split('\n')) {
    if (!/^\| \d{2} · /.test(line)) continue;
    const [name, capability, topics, milestone] = line.split('|').slice(1, -1).map((cell) => cell.trim());
    const [id, title] = name.split(' · ');
    course.stages.push({ id, title, capability, topics, milestone });
  }
  if (!course.stages.length) throw new Error('No curriculum stages found in docs/roadmap.md');

  // Avoid deleting and re-adding unchanged pages while VitePress indexes a dev session.
  const generated = new Set();
  async function publish(relative, contents) {
    const destination = path.join(output, relative);
    generated.add(destination);
    try {
      if (await readFile(destination, 'utf8') === contents) return false;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
    return true;
  }
  for (const [source, markdown] of documents) {
    await publish(pagePath(source), markdown);
  }
  for (const source of downloads) {
    await publish(`public/source/${source}`, await readFile(path.join(repoRoot, source), 'utf8'));
  }
  await publish('index.md', await readFile(path.join(siteRoot, 'home.md'), 'utf8'));
  await publish('public/favicon.svg', await readFile(path.join(siteRoot, 'favicon.svg'), 'utf8'));
  await publish('public/.nojekyll', '');
  try {
    const customDomain = (await readFile(path.join(siteRoot, 'CNAME'), 'utf8')).trim();
    if (customDomain) await publish('public/CNAME', `${customDomain}\n`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const metadataChanged = await publish('course.json', `${JSON.stringify(course, null, 2)}\n`);
  async function prune(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) await prune(full);
      else if (!generated.has(full)) await rm(full);
    }
  }
  await prune(output);
  console.log(`Synced ${documents.size} pages, ${course.lessons.length} lessons, ${downloads.length} source files.`);
  return { metadataChanged };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await syncContent();
