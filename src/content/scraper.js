const MAX_SCRAPE_PAGES = 50;
const CHATROOM_PAGE_SIZE = 20;

// DEBUG: set true to skip API calls and return fake data
const SCRAPE_MOCK = false;
const MOCK_APPLIED = ['台積電', '聯發科', '鴻海', 'Google Taiwan', 'TSMC'];
const MOCK_CONTACTED = ['Line Taiwan', 'Garena', 'Trend Micro', '趨勢科技'];

async function scrapeAppliedCompanies(onProgress) {
  if (SCRAPE_MOCK) {
    if (onProgress) onProgress(1, 1);
    return MOCK_APPLIED;
  }
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

async function scrapeContactedCompanies(onProgress) {
  if (SCRAPE_MOCK) {
    if (onProgress) onProgress(1, 1);
    return MOCK_CONTACTED;
  }
  const companies = new Set();
  let page = 1;
  let lastPage = 1;

  do {
    const res = await fetch(
      `https://pda.104.com.tw/api/messages/chatrooms?page=${page}&pageSize=${CHATROOM_PAGE_SIZE}`,
      { credentials: 'include' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json?.data || !json?.metadata?.pagination?.lastPage) {
      throw new Error('Unexpected API response format');
    }

    json.data.forEach((item) => {
      if (item.custNo && item.custName) companies.add(item.custName);
    });
    lastPage = Math.min(json.metadata.pagination.lastPage, MAX_SCRAPE_PAGES);

    if (onProgress) onProgress(page, lastPage);
    page++;
  } while (page <= lastPage);

  return [...companies];
}
