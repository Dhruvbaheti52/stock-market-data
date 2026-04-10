# Daily Market Analyzer Dashboard 

## Project Overview

The Daily Market Analyzer Dashboard is a web application that will display and analyze stock market data for a specific trading day using a public API. The application focuses on helping users understand market performance by presenting key stock data such as open, high, low, close prices, volume, and volume-weighted average price.

This project is part of a graded assignment to demonstrate understanding of JavaScript, API integration, and user interface development.

---

## Project Idea

The application will allow users to explore stock market data for a selected day and perform basic analysis. Users will be able to:

* View stock data for multiple companies
* Search for specific stocks using ticker symbols
* Analyze stock performance based on price movements
* Identify gainers and losers in the market

---

## API Selection

This project will use the Finnhub API to retrieve daily aggregated stock data.

The API provides:

* Open price (o)
* High price (h)
* Low price (l)
* Close price (c)
* Volume (v)
* Volume-weighted average price (vw)

Example response structure:

```id="n8u4x2"
{
  "T": "VSAT",
  "o": 34.9,
  "h": 35.47,
  "l": 34.21,
  "c": 34.24,
  "v": 312583,
  "vw": 34.4736
}
```

---

## Planned Features

The following features are planned for future milestones:

* Search functionality based on stock ticker
* Filtering options such as gainers, losers, and high-volume stocks
* Sorting options based on price, volume, or volatility
* Dynamic display of stock data in a structured layout
* Basic calculations such as percentage gain or loss
* Responsive design for different screen sizes

---

## Technologies to be Used

* HTML
* CSS 
* JavaScript (ES6)
* Fetch API
