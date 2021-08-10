import * as util from 'util';
import * as storage from 'electron-json-storage';

export type BookmarkType = {[T: string]: string};

const key = 'bookmark';

export default class Bookmark {
  static async get(): Promise<BookmarkType> {
    const bookmarks = await this.getData();
    if (Object.keys(bookmarks).length && !bookmarks['0']) {
      return bookmarks;
    } else {
      const defaultBookmark: BookmarkType = { 'https://builder.ptosh.com': 'builder' };
      await this.setData(defaultBookmark);
      return defaultBookmark;
    }
  }

  static async add(url: string, title: string) {
    const bookmarks = await this.getData();
    bookmarks[url] = title;
    await this.setData(bookmarks);
  }

  static async delete(url?: string) {
    if (url) {
      const bookmarks = await this.getData();
      delete bookmarks[url];
      await this.setData(bookmarks);
    }
  }
  static getData() {
    return util.promisify(storage.get)(key) as Promise<BookmarkType>;
  }
  static setData(data: BookmarkType) {
    return util.promisify(storage.set)(key, data);
  }
}

