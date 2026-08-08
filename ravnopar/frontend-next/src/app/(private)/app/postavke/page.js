import { createNoindexMetadata } from '../../../../lib/metadata';
import SettingsClient from './SettingsClient';

export const metadata = createNoindexMetadata('Postavke — Ravnopar');

export default function Page() {
  return <SettingsClient />;
}
