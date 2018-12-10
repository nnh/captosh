import Bookmark from './bookmark';

export default class BookmarkEvent {
  constructor({ select, moveButton, deleteButton, addButton, getActiveTab, showDialog }) {
    this.controls = { select, moveButton, deleteButton, addButton };
    this.getActiveTab = getActiveTab;
    this.showDialog = showDialog;

    this.controls.moveButton.addEventListener('click', this.onMove.bind(this));
    this.controls.deleteButton.addEventListener('click', this.onDelete.bind(this));
    this.controls.addButton.addEventListener('click', this.onAdd.bind(this));

    this.prepareBookmarks();
  }

  onMove() {
    const bookmarkSelect = this.controls.select;
    const selected = bookmarkSelect.options[bookmarkSelect.selectedIndex];
    if (selected) {
      this.getActiveTab().webview.setAttribute('src', selected.value);
    }
  }

  async onDelete() {
    const bookmarkSelect = this.controls.select;
    const selected = bookmarkSelect.options[bookmarkSelect.selectedIndex];
    if (!selected) {
      return;
    }

    try {
      await Bookmark.delete(selected.value);
      bookmarkSelect.remove(bookmarkSelect.selectedIndex);
    } catch(error) {
      showDialog(error.toString());
    }
  }

  async onAdd() {
    const webview = this.getActiveTab().webview;
    try {
      await Bookmark.add(webview.src, webview.getTitle());
      this.prepareBookmarks();
    } catch(error) {
      showDialog(error.toString());
    }
  }

  async prepareBookmarks() {
    const bookmarkSelect = this.controls.select;
    bookmarkSelect.innerText = null;

    try {
      // await Bookmark.clearAll();
      const bookmarks = await Bookmark.get();
      const keys = Object.keys(bookmarks);
      for (const key of keys) {
        const option = document.createElement('option');
        option.value = key;
        option.text = `${bookmarks[key]}: ${key}`;
        bookmarkSelect.add(option);
      }
    } catch(error) {
      showDialog(error.toString());
    }
  }
}
