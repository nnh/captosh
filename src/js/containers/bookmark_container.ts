import { connect } from 'react-redux';
import { getBookmarks, selectBookmark, deleteBookmark, addBookmark } from '../actions/bookmark_actions';
import { BookmarkType } from '../bookmark';

type BookmarkState = {
  bookmarkReducer: {
    selected?: string,
    bookmarks: BookmarkType,
  }
};

const mapStateToProps = (state: BookmarkState) => ({
  selected: state.bookmarkReducer.selected,
  bookmarks: state.bookmarkReducer.bookmarks
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getBookmarks: () => { dispatch(getBookmarks()) },
  selectBookmark: (url: string) => { dispatch(selectBookmark(url)) },
  deleteBookmark: (url?: string) => { dispatch(deleteBookmark(url)) },
  addBookmark: (url: string, title: string) => { dispatch(addBookmark(url, title)) }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
