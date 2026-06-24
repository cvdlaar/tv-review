import { ReviewProvider } from './types';
import { mockReviewProvider } from './mockReviewProvider';
import { eTrustedProvider } from './eTrustedProvider';

const providers: Record<string, ReviewProvider> = {
  mock: mockReviewProvider,
  etrusted: eTrustedProvider,
};

export function getProvider(name: string): ReviewProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Onbekende review provider: ${name}`);
  return provider;
}
