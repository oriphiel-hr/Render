import { createNoindexMetadata } from '../../../../../lib/metadata';
import ChatClient from './ChatClient';

export const metadata = createNoindexMetadata('Chat — Ravnopar');

export default function Page() {
  return <ChatClient />;
}
