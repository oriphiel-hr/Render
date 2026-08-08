import { createNoindexMetadata } from '../../../../../lib/metadata';
import ProfileClient from './ProfileClient';

export const metadata = createNoindexMetadata('Profil — Ravnopar');

export default function Page() {
  return <ProfileClient />;
}
