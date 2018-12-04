import util from 'util';
import storage from 'electron-json-storage';

const key = 'bookmark';
const getStorage = util.promisify(storage.get);
const setStorage = util.promisify(storage.set);
const clearStorage = util.promisify(storage.clear);

export default class Bookmark {
  static async getData() {
    try {
      return await getStorage(key);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async setData(data) {
    try {
      return await setStorage(key, data);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async get() {
    try {
      const bookmarks = await this.getData();
      if (Object.keys(bookmarks).length) {
        return bookmarks;
      } else {
        const defaultBookmark = { 'https://builder.ptosh.com': 'builder' };
        await this.setData(defaultBookmark);
        return defaultBookmark;
      }
    } catch(error) {
      throw new Error(error);
    }
  }

  static async add(url, title) {
    try {
      const bookmarks = await this.getData();
      bookmarks[url] = title;
      await this.setData(bookmarks);
    } catch(error) {
      throw new Error(error);
    }
  }

  static async delete(url) {
    try {
      const bookmarks = await this.getData();
      delete bookmarks[url];
      await this.setData(bookmarks);
      return bookmarks;
    } catch(error) {
      throw new Error(error);
    }
  }

  static async clearAll() {
    try {
      await clearStorage();
    } catch (error) {
      throw new Error(error.message);
    }
  }
}