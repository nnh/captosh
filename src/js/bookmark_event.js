import Bookmark from './bookmark';

window.addEventListener('load', () => {
  const bookmarkSelect = document.getElementById('bookmark-select');

  document.getElementById('bookmark-move-button').addEventListener('click', () => {
    const selected = bookmarkSelect.options[bookmarkSelect.selectedIndex];
    if (selected) {
      tabGroup.getActiveTab().webview.setAttribute('src', selected.value);
    }
  });

  document.getElementById('bookmark-delete-button').addEventListener('click', () => {
    const selected = bookmarkSelect.options[bookmarkSelect.selectedIndex];
    if (selected) {
      deleteBookmark(selected.value);
    }
  });

  document.getElementById('bookmark-add-button').addEventListener('click', () => {
    addBookmark(tabGroup.getActiveTab().webview.src, tabGroup.getActiveTab().webview.getTitle());
  })

  prepareBookmarks();
});

async function prepareBookmarks() {
  const bookmarkSelect = document.getElementById('bookmark-select');
  bookmarkSelect.innerText = null

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
  const bookmarkSelect = document.getElementById('bookmark-select');
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