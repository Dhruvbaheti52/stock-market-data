const STOCK_SYMBOLS = [
  "AAPL","TSLA","AMZN","MSFT","GOOGL",
  "NVDA","META","NFLX","AMD","INTC"
];

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
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toUpperCase();
    applyFiltersAndSort();
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

  fetchAllStocks();
}

async function fetchAllStocks() {
  showState("loading");
  allStocks = [];

  try {
    for (let symbol of STOCK_SYMBOLS) {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=4LFB18WI09DY8YES`;
      const stock = await fetchStock(url, symbol);
      if (stock) allStocks.push(stock);
      await new Promise(res => setTimeout(res, 12000));
    }

    if (allStocks.length === 0) {
      throw new Error("No data fetched");
    }

    updateMarketStats();
    applyFiltersAndSort();

  } catch (err) {
    showError(err.message);
  }
}

async function fetchStock(url, symbol) {
  try {
    const res = await fetch(url);
    const data = await res.json();

    const series = data["Time Series (Daily)"];
    if (!series) return null;

    const latestDate = Object.keys(series)[0];
    const today = series[latestDate];

    const open = parseFloat(today["1. open"]);
    const high = parseFloat(today["2. high"]);
    const low = parseFloat(today["3. low"]);
    const close = parseFloat(today["4. close"]);
    const volume = parseInt(today["5. volume"]);

    const change = close - open;
    const changePercent = (change / open) * 100;

    return {
      ticker: symbol,
      open,
      high,
      low,
      close,
      volume,
      vwap: close,
      change,
      changePercent,
      isGain: change >= 0
    };

  } catch {
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

    const sign = stock.isGain ? "+" : "-";
    const arrow = stock.isGain ? "↑" : "↓";

    card.innerHTML = `
      <div class="card-header">
        <span>${stock.ticker}</span>
        <span>$${stock.close.toFixed(2)}</span>
      </div>
      <div>
        ${arrow} ${sign}${Math.abs(stock.changePercent).toFixed(2)}%
      </div>
      <div>
        Vol: ${formatVolume(stock.volume)}
      </div>
    `;

    container.appendChild(card);
  });

  showState("success");
}

function formatVolume(vol) {
  if (vol >= 1e6) return (vol / 1e6).toFixed(1) + "M";
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + "K";
  return vol;
}

function updateMarketStats() {
  const gainers = allStocks.filter(s => s.isGain).length;
  const losers = allStocks.length - gainers;

  marketStatsEl.innerText = `Gainers: ${gainers} | Losers: ${losers}`;
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