'use client';

import { useMemo } from 'react';
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams
} from 'next/navigation';

export function useLocation() {
  const pathname = useNextPathname() || '/';
  const searchParams = useNextSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  return useMemo(() => ({ pathname, search, hash: '' }), [pathname, search]);
}

export function useNavigate() {
  const router = useNextRouter();
  return (to, opts) => {
    if (opts?.replace) router.replace(to);
    else router.push(to);
  };
}

export function useSearchParams() {
  const sp = useNextSearchParams();
  return [sp];
}

export function useParams() {
  return useNextParams() || {};
}

export { Navigate } from './Navigate.jsx';
