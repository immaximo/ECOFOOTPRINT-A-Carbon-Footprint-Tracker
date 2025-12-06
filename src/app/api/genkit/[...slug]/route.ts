
import { createApiHandler } from '@genkit-ai/next';
import '@/ai/dev'; // Make sure this is imported to initialize Genkit and define flows

export const { GET, POST } = createApiHandler();
