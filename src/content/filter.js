const HIDDEN_CLASS = 'jf-hidden';
const HIGHLIGHT_CLASS = 'jf-highlight';
const MATCH_LABEL_CLASS = 'jf-match-label';

(function injectStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .${HIDDEN_CLASS} { display: none !important; }
    .${HIGHLIGHT_CLASS} {
      border-left: 4px solid var(--jf-hl-border, #fbbc04) !important;
      background-color: var(--jf-hl-bg, #fffde7) !important;
    }
    .${MATCH_LABEL_CLASS} {
      font-size: 11px;
      color: #555;
      background: var(--jf-hl-bg, #fffde7);
      border-top: 1px solid var(--jf-hl-border, #fbbc04);
      padding: 3px 12px;
      letter-spacing: 0.01em;
    }
  `;
  document.head.appendChild(style);
})();

function getCardText(card) {
  return card.textContent + ' ' + (card.getAttribute('description') || '');
}

function unhideAll() {
  document.querySelectorAll('.' + HIDDEN_CLASS).forEach((el) => el.classList.remove(HIDDEN_CLASS));
}

function itemMatches(text, item) {
  if (item.isRegex) {
    try {
      return new RegExp(item.text, 'i').test(text);
    } catch (e) {
      return false;
    }
  }
  return text.toLowerCase().includes(item.text.toLowerCase());
}

function anyMatch(text, items) {
  return items.length > 0 && items.some((item) => item.enabled !== false && itemMatches(text, item));
}

function setMatchLabel(card, matchedItems) {
  const existing = card.querySelector('.' + MATCH_LABEL_CLASS);
  if (existing) existing.remove();
  if (!matchedItems.length) return;

  const label = document.createElement('div');
  label.className = MATCH_LABEL_CLASS;
  label.textContent = '⭐ ' + matchedItems.map((item) => item.text).join(', ');
  card.appendChild(label);
}

function scanRoot(root, blockItems, highlightItems) {
  const cards = findAllJobCards(root);
  cards.forEach((card) => {
    const text = getCardText(card);

    if (anyMatch(text, blockItems)) {
      card.classList.add(HIDDEN_CLASS);
    } else {
      card.classList.remove(HIDDEN_CLASS);
    }

    const matched = highlightItems.filter((item) => item.enabled !== false && itemMatches(text, item));
    if (matched.length) {
      const colorKey = matched[0].color || 'yellow';
      const color = HIGHLIGHT_COLORS[colorKey] || HIGHLIGHT_COLORS.yellow;
      card.style.setProperty('--jf-hl-border', color.border);
      card.style.setProperty('--jf-hl-bg', color.bg);
      card.classList.add(HIGHLIGHT_CLASS);
      setMatchLabel(card, matched);
    } else {
      card.style.removeProperty('--jf-hl-border');
      card.style.removeProperty('--jf-hl-bg');
      card.classList.remove(HIGHLIGHT_CLASS);
      setMatchLabel(card, []);
    }
  });
}
