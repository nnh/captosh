export type BookmarkType = {[T: string]: string};

const key = 'bookmark';
const defaultBookmark: BookmarkType = { 'https://builder.ptosh.com': 'builder' };

export default class Bookmark {
  static loaded = false;
  static bookmarks: BookmarkType = {};

  static loadBookmarks() {
    if (!this.loaded) {
      const str = window.localStorage.getItem(key);
      if (str) {
        this.bookmarks = JSON.parse(str) as BookmarkType;
      }
      if (!this.bookmarks || (Object.keys(this.bookmarks).length && !this.bookmarks['0'])) {
        this.bookmarks = defaultBookmark;
        this.saveBookmarks();
      }
      this.loaded = true;
    }
  }

  static get(): BookmarkType {
    this.loadBookmarks();
    return this.bookmarks;
  }

  static add(url: string, title: string) {
    this.loadBookmarks();
    this.bookmarks[url] = title;
    this.saveBookmarks();
  }

  static delete(url?: string) {
    if (url) {
      this.loadBookmarks();
      delete this.bookmarks[url];
      this.saveBookmarks();
    }
  }
  static saveBookmarks() {
    window.localStorage.setItem(key, JSON.stringify(this.bookmarks));
  }
}
