import { appendFileSync } from 'node:fs';
import { pagesBase } from './paths.mjs';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
if (!repository) throw new Error('GITHUB_REPOSITORY is required');
const base = pagesBase(process.env.PAGES_BASE_PATH ||
  (repository.endsWith('.github.io') ? '/' : `/${repository}/`));
if (!process.env.GITHUB_ENV) throw new Error('GITHUB_ENV is required');
appendFileSync(process.env.GITHUB_ENV, `PAGES_BASE_PATH=${base}\n`);
console.log(`GitHub Pages base path: ${base}`);
