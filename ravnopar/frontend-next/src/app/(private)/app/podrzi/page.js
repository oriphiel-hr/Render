import { createNoindexMetadata } from '../../../../lib/metadata';
import DonateClient from './DonateClient';

export const metadata = createNoindexMetadata('Podrži — Ravnopar');

export default function Page() {
  return <DonateClient />;
}
