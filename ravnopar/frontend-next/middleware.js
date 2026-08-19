import { NextResponse } from 'next/server';
import { SUPPORTED_LOCALES } from './src/lib/i18n/locale-meta.js';
import { PUBLIC_PATHS, stripLocaleFromPath } from './src/lib/seo.js';

export function middleware(request) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
