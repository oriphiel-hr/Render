import { createNoindexMetadata } from '../../../lib/metadata';
import AppHomeClient from './AppHomeClient';

export const metadata = createNoindexMetadata('Moj prostor — Ravnopar');

export default function Page() {
  return <AppHomeClient />;
}
