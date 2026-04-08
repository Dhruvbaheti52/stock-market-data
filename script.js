const STOCK_SYMBOLS = [
  "AAPL","TSLA","AMZN","MSFT","GOOGL",
  "NVDA","META","NFLX","AMD","INTC"
];

const API_KEY = "d7av3shr01qtpbh9uabgd7av3shr01qtpbh9uac0";

let allStocks = [];
let currentSearch = "";
let currentFilter = "all";
let currentSort = "default";

const container = document.getElementById("stock-container");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const errorText = document.getElementById("errorText");
const noResultsEl = document.getElementById("noResults");
const marketStatsEl = document.getElementById("marketStats");
const retryBtn = document.getElementById("retryBtn");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const sortSelect = document.getElementById("sortSelect");

function init() {
  let debounceTimer;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = e.target.value.toUpperCase();
      applyFiltersAndSort();
    }, 300);
  });

  filterSelect.addEventListener("change", (e) => {
    currentFilter = e.target.value;
    applyFiltersAndSort();
  });

  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    applyFiltersAndSort();
  });

  retryBtn.addEventListener("click", fetchAllStocks);

  // date display
  const dateEl = document.getElementById("dateDisplay");
  dateEl.innerText = new Date().toLocaleDateString();

  fetchAllStocks();
}

async function fetchAllStocks() {
  showState("loading");
  allStocks = [];

  // cache (30 sec)
  const cache = localStorage.getItem("stocksCache");
  if (cache) {
    const { data, time } = JSON.parse(cache);
    if (Date.now() - time < 30000) {
      allStocks = data;
      updateMarketStats();
      applyFiltersAndSort();
      return;
    }
  }

  try {
    const promises = STOCK_SYMBOLS.map(symbol => fetchStock(symbol));
    const results = await Promise.all(promises);

    allStocks = results.filter(Boolean);

    if (allStocks.length === 0) {
      throw new Error("No data fetched");
    }

    localStorage.setItem("stocksCache", JSON.stringify({
      data: allStocks,
      time: Date.now()
    }));

    updateMarketStats();
    applyFiltersAndSort();

  } catch (err) {
    showError(err.message);
  }
}

async function fetchStock(symbol) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.c === 0) return null;

    const open = data.o;
    const close = data.c;
    const high = data.h;
    const low = data.l;
    const prevClose = data.pc;

    
    const change = close - prevClose;
    const changePercent = (change / prevClose) * 100;

    return {
      ticker: symbol,
      open,
      close,
      high,
      low,
      prevClose,
      change,
      changePercent,
      isGain: change >= 0
    };

  } catch (err) {
    console.error(symbol, err);
    return null;
  }
}

function applyFiltersAndSort() {
  let filtered = [...allStocks];

  if (currentSearch) {
    filtered = filtered.filter(s => s.ticker.includes(currentSearch));
  }

  if (currentFilter === "gainers") {
    filtered = filtered.filter(s => s.isGain);
  } else if (currentFilter === "losers") {
    filtered = filtered.filter(s => !s.isGain);
  }

  switch (currentSort) {
    case "priceDesc":
      filtered.sort((a, b) => b.close - a.close);
      break;
    case "priceAsc":
      filtered.sort((a, b) => a.close - b.close);
      break;
    case "changeDesc":
      filtered.sort((a, b) => b.changePercent - a.changePercent);
      break;
    case "changeAsc":
      filtered.sort((a, b) => a.changePercent - b.changePercent);
      break;
  }

  renderStocks(filtered);
}

function renderStocks(stocks) {
  if (stocks.length === 0) {
    showState("noResults");
    return;
  }

  container.innerHTML = "";

  stocks.forEach(stock => {
    const card = document.createElement("div");
    card.className = `card ${stock.isGain ? "is-gain" : "is-loss"}`;

    const arrow = stock.isGain ? "↑" : "↓";

    card.innerHTML = `
      <div class="card-header">
        <span>${stock.ticker}</span>
        <span class="price">$${stock.close.toFixed(2)}</span>
      </div>

      <div>
        ${arrow} ${Math.abs(stock.changePercent).toFixed(2)}%
      </div>

      <div class="card-stats">
        <div class="stat-item">
          <span>High</span>
          <span class="stat-value">$${stock.high.toFixed(2)}</span>
        </div>
        <div class="stat-item">
          <span>Low</span>
          <span class="stat-value">$${stock.low.toFixed(2)}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  showState("success");
}

function updateMarketStats() {
  const gainers = allStocks.filter(s => s.isGain).length;
  const losers = allStocks.length - gainers;

  const topGainer = [...allStocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  const topLoser = [...allStocks].sort((a, b) => a.changePercent - b.changePercent)[0];

  marketStatsEl.innerText = `
    Gainers: ${gainers} | Losers: ${losers}
    | Top: ${topGainer.ticker} (+${topGainer.changePercent.toFixed(2)}%)
    | Worst: ${topLoser.ticker} (${topLoser.changePercent.toFixed(2)}%)
  `;
}

function showState(state) {
  loadingEl.classList.add("hidden");
  errorEl.classList.add("hidden");
  noResultsEl.classList.add("hidden");
  container.classList.add("hidden");

  if (state === "loading") loadingEl.classList.remove("hidden");
  if (state === "error") errorEl.classList.remove("hidden");
  if (state === "noResults") noResultsEl.classList.remove("hidden");
  if (state === "success") container.classList.remove("hidden");
}

function showError(msg) {
  errorText.innerText = msg;
  showState("error");
}

init();
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const newTheme = current === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);