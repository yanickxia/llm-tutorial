import path from 'node:path';

export function pagesBase(value = process.env.PAGES_BASE_PATH ?? '/') {
  const base = `/${value.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
  if (!/^\/(?:[a-zA-Z0-9._-]+\/)*$/.test(base) || base.includes('/../')) {
    throw new Error(`Invalid PAGES_BASE_PATH: ${value}`);
  }
  return base;
}

export function pagePath(source) {
  return source.replace(/(^|\/)README\.md$/, '$1index.md');
}

export function pageUrl(source) {
  return `/${pagePath(source).replace(/index\.md$/, '').replace(/\.md$/, '.html')}`;
}

export function resolveSourceLink(href, source, course, base = '/') {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) return href;
  const [, rawPath, suffix] = href.match(/^([^?#]*)(.*)$/);
  if (!rawPath) return href;
  const decoded = decodeURIComponent(rawPath);
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(source), decoded));
  const candidate = decoded.endsWith('/') ? path.posix.join(target, 'README.md') : target;
  const url = course.routes[candidate] ?? course.downloads[candidate];
  if (!url) throw new Error(`Unmapped repository link in ${source}: ${href}`);
  return `${base.replace(/\/$/, '')}${url}${suffix}`;
}
