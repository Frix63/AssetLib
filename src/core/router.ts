export interface RouteState {
  type: 'group' | 'category' | 'all' | 'home';
  groupId?: string;
  categoryId?: string;
}

export function getBasePath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname.startsWith('/assetlib') ? '/assetlib' : '';
}

export function parseRoute(pathname: string = '', hash: string = '', search: string = ''): RouteState {
  // Strip optional /assetlib subfolder prefix if present
  const cleanPath = pathname.replace(/^\/assetlib(?:\/|$)/i, '/') || '/';

  // 1. Pathname check: /group/:id or /groups/:id
  const groupMatch = cleanPath.match(/^\/(?:group|groups)\/([a-zA-Z0-9_-]+)\/?$/i);
  if (groupMatch) {
    return { type: 'group', groupId: groupMatch[1].toLowerCase() };
  }

  // Pathname check: /category/:id or /categories/:id
  const catMatch = cleanPath.match(/^\/(?:category|categories)\/([a-zA-Z0-9_-]+)\/?$/i);
  if (catMatch) {
    return { type: 'category', categoryId: catMatch[1] };
  }

  // Pathname check: /all
  if (/^\/all\/?$/i.test(cleanPath)) {
    return { type: 'all' };
  }

  // 2. Hash fallback: #/group/:id or #group/:id
  if (hash) {
    const hashClean = hash.replace(/^#\/?/, '');
    const hashGroupMatch = hashClean.match(/^(?:group|groups)\/([a-zA-Z0-9_-]+)\/?$/i);
    if (hashGroupMatch) {
      return { type: 'group', groupId: hashGroupMatch[1].toLowerCase() };
    }
    const hashCatMatch = hashClean.match(/^(?:category|categories)\/([a-zA-Z0-9_-]+)\/?$/i);
    if (hashCatMatch) {
      return { type: 'category', categoryId: hashCatMatch[1] };
    }
    if (/^all\/?$/i.test(hashClean)) {
      return { type: 'all' };
    }
  }

  // 3. Search params fallback: ?group=:id or ?category=:id
  if (search) {
    try {
      const params = new URLSearchParams(search);
      const groupParam = params.get('group') || params.get('g');
      if (groupParam) {
        return { type: 'group', groupId: groupParam.toLowerCase() };
      }
      const catParam = params.get('category') || params.get('c');
      if (catParam) {
        return { type: 'category', categoryId: catParam };
      }
      if (params.get('view') === 'all') {
        return { type: 'all' };
      }
    } catch {
      // Ignore URLSearchParams error
    }
  }

  return { type: 'home' };
}

export function getRouteFromLocation(): RouteState {
  if (typeof window === 'undefined') return { type: 'home' };
  return parseRoute(window.location.pathname, window.location.hash, window.location.search);
}

export function navigateToGroup(groupId: string, title?: string): void {
  if (typeof window === 'undefined') return;
  const base = getBasePath();
  const target = `${base}/group/${groupId}`;
  if (window.location.pathname !== target) {
    window.history.pushState({ type: 'group', groupId }, '', target);
  }
  if (typeof document !== 'undefined') {
    document.title = title ? `${title} • AssetLib` : 'AssetLib';
  }
}

export function navigateToCategory(categoryId: string, title?: string): void {
  if (typeof window === 'undefined') return;
  const base = getBasePath();
  const target = categoryId === 'all' ? (base || '/') : `${base}/category/${categoryId}`;
  if (window.location.pathname !== target) {
    window.history.pushState({ type: 'category', categoryId }, '', target);
  }
  if (typeof document !== 'undefined') {
    document.title = title ? `${title} • AssetLib` : 'AssetLib';
  }
}

export function navigateToAll(): void {
  if (typeof window === 'undefined') return;
  const base = getBasePath();
  const target = `${base}/all`;
  if (window.location.pathname !== target) {
    window.history.pushState({ type: 'all' }, '', target);
  }
  if (typeof document !== 'undefined') {
    document.title = 'All Shapes • AssetLib';
  }
}

export function navigateToHome(): void {
  if (typeof window === 'undefined') return;
  const base = getBasePath();
  const target = base || '/';
  if (window.location.pathname !== target) {
    window.history.pushState({ type: 'home' }, '', target);
  }
  if (typeof document !== 'undefined') {
    document.title = 'AssetLib';
  }
}
