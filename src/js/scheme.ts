import * as Url from 'url';

export const customScheme = 'captosh://';
export const customSchemeRegExp = new RegExp(customScheme);

export class NoLoginError extends Error {
  url: string;
  constructor(message: string, url: string) {
    super(message);
    this.url = url;
  }
}

export async function captureCaptoshLink(captoshUrl: string, protocol: 'http:' | 'https:') {
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
    throw new NoLoginError('Require sign_in', response.url);
  }

  const text = await response.text();
  const targetUrl = new Url.URL(url);
  return text.split(/\n/).map((value) => {
    const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`;
    if (value.includes(',')) {
      return `${new Url.URL(value.split(',')[0], baseUrl).href},${value.split(',')[1]}`;
    } else {
      return new Url.URL(value, baseUrl).href;
    }
  });
}
