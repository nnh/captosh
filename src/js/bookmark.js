import storage from 'electron-json-storage';
const key = 'bookmark';

function getData() {
  return new Promise((resolve, reject) => {
    storage.get(key, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
}

function setData(data) {
  return new Promise((resolve, reject) => {
    storage.set(key, data, (error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

async function getBookmarks() {
  try {
    const bookmarks = await getData();
    if (Object.keys(bookmarks).length) {
      return bookmarks;
    } else {
      const defaultBookmark = { 'https://builder.ptosh.com': 'builder' };
      await setData(defaultBookmark);
      return defaultBookmark;
    }
  } catch(error) {
    throw new Error(error);
  }
}

async function addBookmark(url, title) {
  try {
    const bookmarks = await getData();
    bookmarks[url] = title;
    await setData(bookmarks);
  } catch(error) {
    throw new Error(error);
  }
}

async function deleteBookmark(url) {
  try {
    const bookmarks = await getData();
    delete bookmarks[url];
    await setData(bookmarks);
    return bookmarks;
  } catch(error) {
    throw new Error(error);
  }
}

function clearAll() {
  return new Promise((resolve, reject) => {
    storage.clear((error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export default {
  getBookmarks: getBookmarks,
  addBookmark: addBookmark,
  deleteBookmark: deleteBookmark,
  clearAll: clearAll
}