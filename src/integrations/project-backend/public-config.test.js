import { expect, test } from 'bun:test';
import { projectBackendPublicConfig } from './public-config';

test('publishing without environment injection retains the selected external backend', () => {
  expect(projectBackendPublicConfig.url).toBe('https://ekkwdddrjekaltkrzqam.supabase.co');
  expect(projectBackendPublicConfig.publishableKey).toBe('sb_publishable_IUqwG6JprHiVIVKf9OizBg_R_CdSGXo');
  expect(projectBackendPublicConfig.publishableKey.startsWith('sb_publishable_')).toBe(true);
});