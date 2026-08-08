import { createNoindexMetadata } from '../../../../lib/metadata';
import OnboardingClient from './OnboardingClient';

export const metadata = createNoindexMetadata('Onboarding — Ravnopar');

export default function Page() {
  return <OnboardingClient />;
}
