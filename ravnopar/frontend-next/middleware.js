import { NextResponse } from 'next/server';
import { SUPPORTED_LOCALES } from './src/lib/i18n/locale-meta.js';
import { PUBLIC_PATHS, stripLocaleFromPath } from './src/lib/seo.js';

/** Next.js 15 rejects %5B/%5D in /_next/static/ with 400; rewrite to literal brackets. */
function rewriteStaticChunkPath(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/_next/static/')) return null;

  const decoded = pathname
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')');

  if (decoded === pathname) return null;

  const url = request.nextUrl.clone();
  url.pathname = decoded;
  return NextResponse.rewrite(url);
}

export function middleware(request) {
  const staticRewrite = rewriteStaticChunkPath(request);
  if (staticRewrite) return staticRewrite;

  const host = (request.headers.get('host') || '').toLowerCase();
  if (host.startsWith('www.')) {
    const dest = request.nextUrl.clone();
    dest.hostname = host.replace(/^www\./, '');
    dest.protocol = 'https:';
    dest.port = '';
    return NextResponse.redirect(dest, 301);
  }

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/app') ||
    pathname.startsWith('/admin')
  ) {
    return NextResponse.next();
  }

  const { locale, path } = stripLocaleFromPath(pathname);

  if (!locale && PUBLIC_PATHS.includes(pathname === '' ? '/' : pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/hr' : `/hr${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  if (locale && !SUPPORTED_LOCALES.includes(locale)) {
    return NextResponse.next();
  }

  if (locale && path !== '/' && !PUBLIC_PATHS.includes(path)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/_next/static/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
