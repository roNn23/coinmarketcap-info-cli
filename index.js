#! /usr/bin/env node

const puppeteer = require('puppeteer')
const Table = require('cli-table3')
const ora = require('ora')
const chalk = require('chalk')

const spinner = ora('Loading data').start();

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  try {
    await page.goto('https://coinmarketcap.com', { waitUntil: 'networkidle2' })
  } catch (error) {
    spinner.stop()
    console.error(error)
  }

  let marketCap = await page.evaluate(() => document.querySelector('[data-global-stats-market-cap]').textContent)
  let marketVol = await page.evaluate(() => document.querySelector('[data-global-stats-volume]').textContent)
  let btcDominance = await page.evaluate(() => document.querySelector('[data-global-stats-btc-dominance]').textContent)

  let currenciesData = await page.evaluate(() => {
    let tableRows = document.querySelectorAll('table#currencies tr')
    let data = []
    for (var i = 0; i < tableRows.length; i++) {
      let currencySorting = tableRows[i].querySelector('.sorting_1')
      let currencySymbol = tableRows[i].querySelector('.currency-name .currency-symbol')
      let currencyName = tableRows[i].querySelector('.currency-name .currency-name-container')
      let currencyPrice = tableRows[i].querySelector('.price')
      let currencyPercent24h = tableRows[i].querySelector('[data-timespan="24h"]')
      if (currencyPercent24h) {
        data.push({
          'sorting': currencySorting.textContent.trim(),
          'symbol': currencySymbol.textContent,
          'name': currencyName.textContent,
          'price': currencyPrice.textContent,
          'percent24h': parseFloat(currencyPercent24h.getAttribute('data-percentusd')).toFixed(2)
        })
      }
    }

    return data
  })

  await browser.close()

  spinner.stop()

  displayHeader()
  displayTable()

  function buildTable () {
    const cliTable = new Table({
      head: ['Sorting', 'Symbol', 'Name', 'Price', 'Change 24 h']
    })

    for (var i = 0; i < 10; i++) {
      cliTable.push([
        currenciesData[i].sorting,
        currenciesData[i].symbol,
        currenciesData[i].name,
        currenciesData[i].price,
        renderColorfulPercentage(currenciesData[i].percent24h)
      ])
    }

    return cliTable.toString()
  }

  function displayTable () {
    console.log(buildTable())
  }

  function renderColorfulPercentage (percentValue) {
    let renderValue = chalk.green(percentValue)

    if (percentValue < 0) {
      renderValue = chalk.red(percentValue)
    }
    return renderValue + ' %'
  }

  function displayHeader () {
    console.log('Market Cap: ' + marketCap)
    console.log('24h Vol: ' + marketVol)
    console.log('BTC Dominance: ' + btcDominance + ' %')
  }
})()
