import { sanitizePath } from '../src/js/filename';

test('adds 1 + 2 to equal 3', () => {
  expect(sanitizePath('../../bash')).toBe('bash');
});
