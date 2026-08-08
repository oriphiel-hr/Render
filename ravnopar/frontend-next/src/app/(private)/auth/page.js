import { createNoindexMetadata } from '../../../lib/metadata';
import AuthClient from './AuthClient';

export const metadata = createNoindexMetadata('Prijava — Ravnopar');

export default function Page() {
  return <AuthClient />;
}
