'use client';

import AppProviders from '../../components/AppProviders';

export default function PrivateLayout({ children }) {
  return <AppProviders locale="hr">{children}</AppProviders>;
}
