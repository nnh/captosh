import React from 'react';
import { Button } from 'react-bootstrap';

class BookmarkView extends React.Component {
  constructor(props) {
    super(props);

    this.moveBookmark = this.moveBookmark.bind(this);
  }

  componentDidMount() {
    this.props.getBookmarks();
  }

  render() {
    const options = Object.keys(this.props.bookmarks).map((key) => {
      return <option value={key} key={`bookmark-option-${key}`}>{`${this.props.bookmarks[key]}: ${key}`}</option>;
    });
    return (
      <div className='bookmark-bar'>
        ブックマーク
        <select className='bookmark-select form-control' value={this.props.selected} onChange={(e) => this.props.selectBookmark(e.target.value)}>
          {options}
        </select>
        <Button bsStyle='default' title='選択中のブックマークに移動' onClick={this.moveBookmark}><i className='fa fa-sign-in'></i></Button>
        <Button bsStyle='default' title='選択中のブックマークを削除' onClick={() => this.props.deleteBookmark(this.props.selected)}><i className='fa fa-trash'></i></Button>
        <Button bsStyle='default' title='表示中のページをブックマークに追加' onClick={() => this.props.addBookmark(this.props.currentUrl, this.props.currentTitle)}>
          <i className='fa fa-plus'></i>
        </Button>
      </div>
    );
  };

  moveBookmark() {
    if (!this.props.selected) return;

    this.props.submit(this.props.selected);
  }
}

export default BookmarkView;