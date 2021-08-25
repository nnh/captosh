import { sanitizePath } from '../src/js/filename';

describe('sanitizePath', () => {
  test('dir safe', () => {
    expect(sanitizePath('../../bash.exe')).toBe('bash.exe');
  });

  test('exclude root path', () => {
    expect(sanitizePath('/bin/bash.exe')).toBe('bin/bash.exe');
  })

  test('replace invalid caras', () => {
    expect(sanitizePath('bin/<bash? (1).exe')).toBe('bin/_bash_ (1).exe');
  })
});
