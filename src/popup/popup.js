// constants.js and storage.js loaded before this file via popup.html

let activeColorPicker = null;

function closeColorPicker() {
  if (activeColorPicker) {
    activeColorPicker.remove();
    activeColorPicker = null;
  }
}

function showColorPicker(anchorBtn, activeKey, onSelect) {
  closeColorPicker();
  const picker = document.createElement('div');
  picker.className = 'color-picker-dropdown';
  HIGHLIGHT_COLOR_KEYS.forEach((key) => {
    const btn = document.createElement('button');
    btn.className = 'color-swatch' + (key === activeKey ? ' active' : '');
    btn.style.background = HIGHLIGHT_COLORS[key].border;
    btn.title = key;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect(key);
      closeColorPicker();
    });
    picker.appendChild(btn);
  });
  document.body.appendChild(picker);
  activeColorPicker = picker;
  const rect = anchorBtn.getBoundingClientRect();
  const pw = picker.offsetWidth;
  const ph = picker.offsetHeight;
  const left = Math.min(rect.left, window.innerWidth - pw - 4);
  const top = rect.bottom + 4 + ph > window.innerHeight ? rect.top - ph - 4 : rect.bottom + 4;
  picker.style.left = Math.max(0, left) + 'px';
  picker.style.top = top + 'px';
  setTimeout(() => document.addEventListener('click', closeColorPicker, { once: true }), 0);
}

function parseEntries(raw) {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((text) => ({ text, isRegex: false }));
}

async function addTo(getter, setter, entries) {
  const current = await getter();
  const existingTexts = new Set(current.map((k) => k.text));
  const newItems = entries.filter((e) => !existingTexts.has(e.text));
  if (newItems.length) await setter([...current, ...newItems]);
}

function renderList(listId, items, onRemove, onToggleRegex, onToggleEnabled, onChangeColor, onReorder) {
  const list = document.getElementById(listId);
  list.innerHTML = '';

  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'empty-msg';
    li.textContent = '（無）';
    list.appendChild(li);
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.enabled === false) li.classList.add('disabled');
    if (onChangeColor) {
      const c = HIGHLIGHT_COLORS[item.color || 'yellow'] || HIGHLIGHT_COLORS.yellow;
      li.style.background = c.bg;
      li.style.borderLeft = `3px solid ${c.border}`;
    }

    if (onReorder) {
      li.draggable = true;
      li.classList.add('draggable');
      li.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
        li.classList.add('dragging');
      });
      li.addEventListener('dragend', () => li.classList.remove('dragging'));
      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        li.classList.add('drag-over');
      });
      li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
      li.addEventListener('drop', (e) => {
        e.preventDefault();
        li.classList.remove('drag-over');
        const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (from !== index) onReorder(from, index);
      });
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'kw-checkbox';
    checkbox.checked = item.enabled !== false;
    checkbox.title = item.enabled === false ? '啟用' : '停用';
    checkbox.addEventListener('change', () => onToggleEnabled(item.id));

    const span = document.createElement('span');
    span.className = 'kw-text';
    span.textContent = item.text;

    const regexBtn = document.createElement('button');
    regexBtn.className = 'regex-btn' + (item.isRegex ? ' active' : '');
    regexBtn.textContent = 'RE';
    regexBtn.title = item.isRegex ? '停用 Regex' : '啟用 Regex';
    regexBtn.addEventListener('click', () => onToggleRegex(item.id));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', `移除 ${item.text}`);
    removeBtn.addEventListener('click', () => onRemove(item.id));

    li.appendChild(checkbox);
    li.appendChild(span);

    if (onChangeColor) {
      const activeKey = item.color || 'yellow';
      const colorBtn = document.createElement('button');
      colorBtn.className = 'color-btn';
      const activeColor = HIGHLIGHT_COLORS[activeKey] || HIGHLIGHT_COLORS.yellow;
      colorBtn.style.background = activeColor.border;
      colorBtn.title = activeKey;
      colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showColorPicker(colorBtn, activeKey, (newKey) => onChangeColor(item.id, newKey));
      });
      li.appendChild(colorBtn);
    }

    li.appendChild(regexBtn);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function wireSection({ inputId, addBtnId, listId, getter, setter, showColor = false }) {
  const input = document.getElementById(inputId);
  const addBtn = document.getElementById(addBtnId);

  async function refresh() {
    const items = await getter();
    renderList(
      listId,
      items,
      async (id) => {
        const current = await getter();
        await setter(current.filter((k) => k.id !== id));
      },
      async (id) => {
        const current = await getter();
        await setter(current.map((k) => k.id === id ? { ...k, isRegex: !k.isRegex } : k));
      },
      async (id) => {
        const current = await getter();
        await setter(current.map((k) => k.id === id ? { ...k, enabled: k.enabled === false ? true : false } : k));
      },
      showColor ? async (id, color) => {
        const current = await getter();
        await setter(current.map((k) => k.id === id ? { ...k, color } : k));
      } : null,
      showColor ? async (from, to) => {
        const current = await getter();
        const updated = [...current];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        await setter(updated);
      } : null,
    );
  }

  addBtn.addEventListener('click', async () => {
    const entries = parseEntries(input.value);
    if (!entries.length) return;
    await addTo(getter, setter, entries);
    input.value = '';
    await refresh();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
  });

  return refresh;
}

async function init() {
  const refreshBlock = wireSection({
    inputId: 'block-input',
    addBtnId: 'block-add-btn',
    listId: 'block-list',
    getter: getKeywords,
    setter: setKeywords,
  });

  const refreshHighlight = wireSection({
    inputId: 'highlight-input',
    addBtnId: 'highlight-add-btn',
    listId: 'highlight-list',
    getter: getHighlightKeywords,
    setter: setHighlightKeywords,
    showColor: true,
  });

  await Promise.all([refreshBlock(), refreshHighlight()]);

  document.getElementById('export-btn').addEventListener('click', async () => {
    const [block, highlight] = await Promise.all([getKeywords(), getHighlightKeywords()]);
    downloadJson({ keywords: block, highlightKeywords: highlight }, '104-job-filter.json');
  });

  document.getElementById('import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const block = normalizeItems(data.keywords);
      const highlight = normalizeItems(data.highlightKeywords);
      await Promise.all([
        addTo(getKeywords, setKeywords, block),
        addTo(getHighlightKeywords, setHighlightKeywords, highlight),
      ]);
    } catch (err) {
      alert('匯入失敗：檔案格式錯誤');
    }
    e.target.value = '';
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes[STORAGE_KEY]) refreshBlock();
    if (changes[HIGHLIGHT_KEY]) refreshHighlight();
  });
}

async function initScraper() {
  const scrapeBtn = document.getElementById('scrape-btn');
  const scrapeStatus = document.getElementById('scrape-status');
  const scrapeResults = document.getElementById('scrape-results');
  const scrapeList = document.getElementById('scrape-list');
  let scrapedCompanies = [];

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'scrapeProgress') {
      scrapeStatus.textContent = `抓取中… ${msg.page} / ${msg.lastPage}`;
    }
  });

  scrapeBtn.addEventListener('click', async () => {
    scrapeBtn.disabled = true;
    scrapeStatus.textContent = '連線中…';
    scrapeResults.classList.add('hidden');
    scrapedCompanies = [];

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'scrapeApplied' }, (res) => {
      scrapeBtn.disabled = false;
      if (chrome.runtime.lastError || !res) {
        scrapeStatus.textContent = '❌ 請在 104.com.tw 頁面執行';
        return;
      }
      if (res.error) {
        scrapeStatus.textContent = `❌ ${res.error}`;
        return;
      }
      scrapedCompanies = res.companies;
      scrapeStatus.textContent = `✅ 共 ${scrapedCompanies.length} 間公司`;
      scrapeList.innerHTML = '';
      scrapedCompanies.forEach((name) => {
        const li = document.createElement('li');
        li.textContent = name;
        scrapeList.appendChild(li);
      });
      scrapeResults.classList.remove('hidden');
    });
  });

  document.getElementById('scrape-add-block').addEventListener('click', async () => {
    const entries = scrapedCompanies.map((text) => ({ text, isRegex: false }));
    await addTo(getKeywords, setKeywords, entries);
    scrapeStatus.textContent = '✅ 已加入封鎖清單';
  });

  document.getElementById('scrape-add-highlight').addEventListener('click', async () => {
    const entries = scrapedCompanies.map((text) => ({ text, isRegex: false }));
    await addTo(getHighlightKeywords, setHighlightKeywords, entries);
    scrapeStatus.textContent = '✅ 已加入醒目清單';
  });
}

(async () => {
  await Promise.all([init(), initScraper()]);
})();
