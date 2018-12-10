import util from 'util';
import storage from 'electron-json-storage';

const key = 'bookmark';
const getStorage = util.promisify(storage.get);
const setStorage = util.promisify(storage.set);
const clearStorage = util.promisify(storage.clear);

export default class Bookmark {
  static async getData() {
    return await getStorage(key);
  }

  static async setData(data) {
    await setStorage(key, data);
  }

  static async get() {
    const bookmarks = await this.getData();
    if (Object.keys(bookmarks).length) {
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

  static async clearAll() {
    await clearStorage();
  }
}