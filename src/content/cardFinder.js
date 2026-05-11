const JOB_CARD_SELECTOR = [
  '.job-list-container',
  '.job-summery-desktop',
  'article.js-job-item',
  'article[data-job-name]',
  '[data-jobsource]',
].join(',');

function findAllJobCards(root) {
  if (!root || !root.querySelectorAll) return [];
  const results = [];
  if (root.matches && root.matches(JOB_CARD_SELECTOR)) {
    results.push(root);
  }
  root.querySelectorAll(JOB_CARD_SELECTOR).forEach((el) => results.push(el));
  return results;
}
