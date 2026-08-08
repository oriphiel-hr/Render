import { createNoindexMetadata } from '../../../lib/metadata';
import AdminClient from './AdminClient';

export const metadata = createNoindexMetadata('Admin — Ravnopar');

export default function Page() {
  return <AdminClient />;
}
