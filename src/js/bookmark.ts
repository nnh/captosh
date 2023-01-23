export type BookmarkType = {[T: string]: string};

const key = 'bookmark';
const defaultBookmark: BookmarkType = { 'https://builder.ptosh.com': 'builder' };

export default class Bookmark {
  static loadBookmarks() {
    const str = window.localStorage.getItem(key);
    let bookmarks: BookmarkType | undefined = undefined;
    if (str) {
      try {
        bookmarks = JSON.parse(str) as BookmarkType;
      }
      catch(e: any) {
        console.log(e);
        bookmarks = undefined;
      }
    }
    if (!bookmarks || Object.keys(bookmarks).length === 0) {
      bookmarks = defaultBookmark;
      this.saveBookmarks(defaultBookmark);
    }
    return bookmarks;
  }

  static add(url: string, title: string) {
    const bm = this.loadBookmarks();
    const bookmarks = {...bm, [url]: title };
    console.log({bookmarks});
    this.saveBookmarks(bookmarks);
    return this.loadBookmarks();
  }

  static delete(url?: string) {
    if (url) {
      const bookmarks = this.loadBookmarks();
      delete bookmarks[url];
      this.saveBookmarks(bookmarks);
    }
    return this.loadBookmarks();
  }
  static saveBookmarks(bookmarks: BookmarkType) {
    window.localStorage.setItem(key, JSON.stringify(bookmarks));
  }
}
