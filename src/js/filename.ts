export function sanitizePath(path: string) {
  return path.replace('\\', '/').replace(/\.\.?\//g, '/').replace(/[\\:\*\?"<>\|\f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/gu, '_')
}
