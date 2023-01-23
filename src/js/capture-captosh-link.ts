import * as Url from 'url';
import { customScheme, parseTasks } from './scheme';

export class RequireLoginError extends Error {
  url: string;
  constructor(message: string, url: string) {
    super(message);
    this.url = url;
  }
}

export async function captureCaptoshLink(captoshUrl: string, protocol: 'http:' | 'https:'): Promise<Task[]> {
  const url = captoshUrl.replace(customScheme, `${protocol}//`)
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'text/plain',
    },
    redirect: 'manual'
  });
  if (response.type === 'opaqueredirect' || response.status === 401) {
    throw new RequireLoginError('Require sign_in', response.url);
  }

  const text = await response.text();
  const targetUrl = new Url.URL(url);
  const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`;
  return parseTasks(text).map(task => (
    {
      ...task,
      url: `${new Url.URL(task.url, baseUrl).href}`
    }));
}
