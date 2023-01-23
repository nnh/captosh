//import { parse } from 'csv-parse/sync';

export const customScheme = 'captosh://';
export const customSchemeRegExp = new RegExp(customScheme);

export function parseTasks(text: string): Task[] {
  // const rows = parse(text) as string[][];
  // return rows
  //   .filter(row => row.length > 0)
  //   .map((row) => {
  //     const [url, path] = row;
  //     return {
  //       url,
  //       path
  //     } as Task;
  //   });
  return [];
}
