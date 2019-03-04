import Bookmark from '../bookmark';

async function getAction(dispatch) {
  const bookmarks = await Bookmark.get();
  dispatch({
    type: BookmarkActionType.get,
    bookmarks: bookmarks
  });
};

export const getBookmarks = () => {
  return dispatch => getAction(dispatch);
}

export const selectBookmark = (url) => ({
  type: BookmarkActionType.select,
  url
});

export const deleteBookmark = (url) => {
  return async dispatch => {
    await Bookmark.delete(url);
    getAction(dispatch);
  }
};

export const addBookmark = (url, title) => {
  return async dispatch => {
    await Bookmark.add(url, title);
    getAction(dispatch);
  }
}

export const BookmarkActionType = {
  get: 'GET_BOOKMARKS',
  select: 'SELECT_BOOKMARK'
}
