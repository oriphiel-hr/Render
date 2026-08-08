'use client';

import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import { PUBLIC_PATHS, stripLocaleFromPath } from '../lib/seo';

/**
 * Drop-in zamjena za react-router Link.
 * Javne putanje automatski dobivaju locale prefiks.
 */
export default function Link({ to, href, children, ...props }) {
  const params = useParams();
  const locale = params?.locale;
  let target = href || to || '/';

  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) {
    const { path } = stripLocaleFromPath(target);
    if (locale && PUBLIC_PATHS.includes(path)) {
      target = path === '/' ? `/${locale}` : `/${locale}${path}`;
    }
  }

  return (
    <NextLink href={target} {...props}>
      {children}
    </NextLink>
  );
}
