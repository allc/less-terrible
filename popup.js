// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * Gets the saved status for url.
 *
 * @param {string} url URL whose info is to be retrieved.
 * @param {function(string)} callback called with the saved info for
 *     the given url on success, or a falsy value if no saved info is retrieved.
 */
function getSavedInfo(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.local.get(url, (info) => {
    callback(chrome.runtime.lastError ? null : info[url]);
  });
}

/**
 * Sets the status for url.
 *
 * @param {string} url URL for which status is to be saved.
 * @param {string} stat The status.
 */
function saveStatus(url, stat) {
  getSavedInfo(url, (info) => {
    var items = {};
    if (info) {
      info['stat'] = stat;
      items[url] = info;
    } else {
      var item = { 'stat': background };
      items[url] = item
    }
    chrome.storage.local.set(items);
  });
}

/**
 * Hide or show timeline.
 *
 * @param {boolean} hide Make the timeline hidden or not
 */
function toggleLessTerrible(t, origionalBackground) {
  var background = origionalBackground;
  background = background.replace(/"/g, '\'');  
  if (t) {
    background = "url('http://i1.kym-cdn.com/photos/images/newsfeed/001/091/264/665.jpg')";
  }
  var script = "document.body.style.backgroundImage = \"" + background + "\"";

  chrome.tabs.executeScript({
    code: script
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var checkbox = document.getElementById('less-terr');
    getSavedInfo(url, (info) => {
      if (info && info['stat'] && info['oldBackground'] && info['background'] === info['oldBackground']) {
        checkbox.checked = true;
      }
      checkbox.addEventListener('change', () => {
        toggleLessTerrible(checkbox.checked, info['background']);
      });
    });
    checkbox.addEventListener('change', () => {
      saveStatus(url, checkbox.checked);
    });
  });
});
