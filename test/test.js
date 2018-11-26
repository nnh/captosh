import test from 'ava';
import { Application } from 'spectron';
import electronPath from 'electron';
import path from 'path';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test.before('before', async t => {
  t.context.app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
  });

  await t.context.app.start();
});

test.after('after', async t => {
  await t.context.app.stop();
});

test.serial('launch app', async t => {
  const app = t.context.app;
  await app.client.waitUntilWindowLoaded();

  const win = app.browserWindow;
  t.is(await app.client.getWindowCount(), 2); // mainWindow & webview
  t.false(await win.isMinimized());
  t.false(await win.isDevToolsOpened());
  t.true(await win.isVisible());
  t.true(await win.isFocused());

  const { width, height } = await win.getBounds();
  t.true(width > 0);
  t.true(height > 0);

  await sleep(1000);
  t.is(await app.client.getValue('#url-bar'), 'https://test.ptosh.com/users/sign_in');
});

// test.serial('basic buttons', async t => {
//   const firstURL = 'https://test.ptosh.com/users/sign_in';
//   const testURL = 'https://www.google.co.jp';
//   const c = t.context.app.client;

//   await c.setValue('#url-bar', testURL);
//   c.click('#submit-button');
//   await sleep(1000);
//   t.regex(await c.getHTML('webview'), new RegExp(testURL));

//   c.click('#back-button');
//   await sleep(1000);
//   t.regex(await c.getHTML('webview'), new RegExp(firstURL));

//   c.click('#next-button');
//   await sleep(1000);
//   t.regex(await c.getHTML('webview'), new RegExp(testURL));

//   c.click('#reload-button');
//   await sleep(1000);
//   t.regex(await c.getHTML('webview'), new RegExp(testURL));

//   // #folder-button
// });

// test.serial('save pdf', async t => {
// #photo-button
// #show-datetime
// #show-url
// #prepare-button
// #capture-button
// });

test.serial('tabs', async t => {
  const c = t.context.app.client;

  c.click('#add-tab-button');
  await sleep(1000);
  const addedElements = await c.elements('.etabs-tab-button-close');
  t.is(addedElements.value.length, 2);

  c.click('.etabs-tab-button-close');
  await sleep(1000);
  const removedElements = await c.elements('.etabs-tab-button-close');
  t.is(removedElements.value.length, 1);
});