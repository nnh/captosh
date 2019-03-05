import { BookmarkActionType } from '../actions/bookmark_actions';

const bookmarkReducer = (state = { selected: undefined, bookmarks: {} }, action) => {
  switch (action.type) {
    case BookmarkActionType.get:
      return { selected: Object.keys(action.bookmarks)[0], bookmarks: action.bookmarks };
    case BookmarkActionType.select:
      return { selected: action.url, bookmarks: state.bookmarks };
    default:
      return state;
  }
}

export default bookmarkReducer;