function startObserver(getStateRef) {
  let debounceTimer = null;
  const pending = [];

  const flush = () => {
    const { blockKeywords, highlightKeywords } = getStateRef();
    const nodes = pending.splice(0);
    nodes.forEach((node) => {
      if (node.isConnected) scanRoot(node, blockKeywords, highlightKeywords);
    });
  };

  const scheduleFlush = () => {
    if (debounceTimer !== null) return;
    if (typeof requestIdleCallback !== 'undefined') {
      debounceTimer = requestIdleCallback(() => { debounceTimer = null; flush(); });
    } else {
      debounceTimer = setTimeout(() => { debounceTimer = null; flush(); }, DEBOUNCE_MS);
    }
  };

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) pending.push(node);
      }
    }
    if (pending.length) scheduleFlush();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
