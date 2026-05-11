const MAX_SCRAPE_PAGES = 50;

async function scrapeAppliedCompanies(onProgress) {
  const companies = new Set();
  let page = 1;
  let lastPage = 1;

  do {
    const res = await fetch(
      `https://pda.104.com.tw/applyRecord/ajax/list?page=${page}&status=all`,
      { credentials: 'include' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json?.data || !json?.metadata?.pagination?.lastPage) {
      throw new Error('Unexpected API response format');
    }

    json.data.forEach((item) => companies.add(item.custName));
    lastPage = Math.min(json.metadata.pagination.lastPage, MAX_SCRAPE_PAGES);

    if (onProgress) onProgress(page, lastPage);
    page++;
  } while (page <= lastPage);

  return [...companies];
}
