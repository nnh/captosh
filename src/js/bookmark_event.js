import Bookmark from './bookmark';

let bookmarkSelect, bookmarkMoveButton, bookmarkDeleteButton, bookmarkAddButton;

window.addEventListener('load', () => {
  bookmarkSelect = document.getElementById('bookmark-select');
  bookmarkMoveButton = document.getElementById('bookmark-move-button');
  bookmarkDeleteButton = document.getElementById('bookmark-delete-button');
  bookmarkAddButton = document.getElementById('bookmark-add-button');

  bookmarkMoveButton.addEventListener('click', () => {
    const selected = bookmarkSelect.options[bookmarkSelect.selectedIndex];
    if (selected) {
      tabGroup.getActiveTab().webview.setAttribute('src', selected.value);
    }
  });
  bookmarkDeleteButton.addEventListener('click', () => {
    const selected = bookmarkSelect.options[bookmarkSelect.selectedIndex];
    if (selected) {
      deleteBookmark(selected.value);
    }
  });
  bookmarkAddButton.addEventListener('click', () => {
    addBookmark(tabGroup.getActiveTab().webview.src, tabGroup.getActiveTab().webview.getTitle());
  })

  prepareBookmarks();
});

async function prepareBookmarks() {
  for (let i = bookmarkSelect.options.length - 1; i >= 0; i--) {
    bookmarkSelect.remove(i);
  }

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

async function deleteBookmark(url) {
  try {
    await Bookmark.delete(url);
    bookmarkSelect.remove(bookmarkSelect.selectedIndex);
  } catch(error) {
    showDialog(error.toString());
  }
}

async function addBookmark(url, title) {
  try {
    await Bookmark.add(url, title);
    prepareBookmarks();
  } catch(error) {
    showDialog(error.toString());
  }
}