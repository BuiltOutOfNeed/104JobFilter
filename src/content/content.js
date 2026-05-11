let cachedBlockKeywords = [];
let cachedHighlightKeywords = [];

function getState() {
  return { blockKeywords: cachedBlockKeywords, highlightKeywords: cachedHighlightKeywords };
}

function rescan() {
  unhideAll();
  scanRoot(document.body, cachedBlockKeywords, cachedHighlightKeywords);
}

function patchHistoryMethod(method) {
  const original = history[method];
  history[method] = function (...args) {
    const result = original.apply(this, args);
    rescan();
    return result;
  };
}

(async () => {
  [cachedBlockKeywords, cachedHighlightKeywords] = await Promise.all([
    getKeywords(),
    getHighlightKeywords(),
  ]);

  scanRoot(document.body, cachedBlockKeywords, cachedHighlightKeywords);
  startObserver(getState);

  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');
  window.addEventListener('popstate', rescan);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes[STORAGE_KEY]) cachedBlockKeywords = normalizeItems(changes[STORAGE_KEY].newValue);
    if (changes[HIGHLIGHT_KEY]) cachedHighlightKeywords = normalizeItems(changes[HIGHLIGHT_KEY].newValue);
    if (changes[STORAGE_KEY] || changes[HIGHLIGHT_KEY]) rescan();
  });
})();

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'scrapeApplied') {
    scrapeAppliedCompanies((page, lastPage) => {
      chrome.runtime.sendMessage({ action: 'scrapeProgress', page, lastPage });
    })
      .then((companies) => sendResponse({ companies }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});
