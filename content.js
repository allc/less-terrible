/**
 * Gets the saved status for url.
 *
 * @param {string} url URL whose info is to be retrieved.
 * @param {function(string)} callback called with the saved info for
 *     the given url on success, or a falsy value if no saved info is retrieved.
 */
function ltGetSavedInfo(url, callback) {
    // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
    // for chrome.runtime.lastError to ensure correctness even when the API call
    // fails.
    chrome.storage.local.get(url, (info) => {
        callback(chrome.runtime.lastError ? null : info[url]);
    });
}

/**
 * Sets the background for url.
 *
 * @param {string} url URL for which background is to be saved.
 * @param {string} backgrounf The background.
 */
function ltSaveBackground(url, background) {
    ltGetSavedInfo(url, (info) => {
        var items = {};
        if (info) {
            info['background'] = background;
            items[url] = info;
        } else {
            var item = { 'background': background };
            items[url] = item
        }
        chrome.storage.local.set(items);
    });
}

function ltSaveOldBackground(url, oldBackground) {
    ltGetSavedInfo(url, (info) => {
        var items = {};
        if (info) {
            info['oldBackground'] = oldBackground;
            items[url] = info;
        } else {
            var item = { 'oldBackground': oldBackground };
            items[url] = item
        }
        chrome.storage.local.set(items);
    });
}

let ltUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
var ltOriginalBackground = window.getComputedStyle(document.body).backgroundImage;

ltGetSavedInfo(ltUrl, (info) => {
    if (info) {
        ltSaveOldBackground(ltUrl, info['background']);
        if (info['background'] === ltOriginalBackground) {
            switch (info['stat']) {
                case 'origional':
                  break;
                case 'lt':
                  document.body.style.backgroundImage = "url('http://i1.kym-cdn.com/photos/images/newsfeed/001/091/264/665.jpg')"
                  break;
                case 'url':
                  document.body.style.backgroundImage = "url('" + info['customUrl'] + "')";
                  break;
                default:
                  break;
            }
        }
    }
});
ltSaveBackground(ltUrl, ltOriginalBackground);
