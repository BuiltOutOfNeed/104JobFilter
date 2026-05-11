function normalizeItems(items) {
  return (items || []).map((item) => {
    if (typeof item === 'string') return { id: crypto.randomUUID(), text: item, isRegex: false, enabled: true, color: 'yellow' };
    return {
      ...item,
      id: item.id || crypto.randomUUID(),
      enabled: item.enabled === undefined ? true : item.enabled,
      color: item.color || 'yellow',
    };
  });
}

function getKeywords() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (r) => resolve(normalizeItems(r[STORAGE_KEY])));
  });
}

function setKeywords(items) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: items }, resolve);
  });
}

function getHighlightKeywords() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(HIGHLIGHT_KEY, (r) => resolve(normalizeItems(r[HIGHLIGHT_KEY])));
  });
}

function setHighlightKeywords(items) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [HIGHLIGHT_KEY]: items }, resolve);
  });
}
