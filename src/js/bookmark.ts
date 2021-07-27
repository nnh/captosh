import util from 'util';
import storage from 'electron-json-storage';

export default class Bookmark {
  static async get() {
    const bookmarks = await this.getData();
    if (Object.keys(bookmarks).length && bookmarks[0] !== null) {
      return bookmarks;
    } else {
      const defaultBookmark = { 'https://builder.ptosh.com': 'builder' };
      await this.setData(defaultBookmark);
      return defaultBookmark;
    }
  }

  static async add(url, title) {
    const bookmarks = await this.getData();
    bookmarks[url] = title;
    await this.setData(bookmarks);
  }

  static async delete(url) {
    const bookmarks = await this.getData();
    delete bookmarks[url];
    await this.setData(bookmarks);
  }
}

Bookmark.key = 'bookmark';
Bookmark.getData = () => util.promisify(storage.get)(Bookmark.key);
Bookmark.setData = (data) => util.promisify(storage.set)(Bookmark.key, data);
