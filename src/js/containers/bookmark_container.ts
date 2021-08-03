import { connect } from 'react-redux';
import { getBookmarks, selectBookmark, deleteBookmark, addBookmark } from '../actions/bookmark_actions';

const mapStateToProps = (state) => ({
  selected: state.bookmarkReducer.selected,
  bookmarks: state.bookmarkReducer.bookmarks
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getBookmarks: () => { dispatch(getBookmarks()) },
  selectBookmark: (url) => { dispatch(selectBookmark(url)) },
  deleteBookmark: (url) => { dispatch(deleteBookmark(url)) },
  addBookmark: (url, title) => { dispatch(addBookmark(url, title)) }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
