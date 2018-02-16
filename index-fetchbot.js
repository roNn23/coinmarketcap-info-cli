#! /usr/bin/env node
const FetchBot = require('fetchbot')
const Table = require('cli-table2')
const ora = require('ora')
const chalk = require('chalk')
const spinner = ora('Loading data').start();

const job = {
        'https://coinmarketcap.com': {
            'root': true,
            'fetch': {
                '[data-global-stats-market-cap] as marketCap': '',
                '[data-global-stats-volume] as marketVol': '',
                '[data-global-stats-btc-dominance] as btcDominance': '',

                'table#currencies tr > .sorting_1 as currencySorting': [],
                'table#currencies tr > .currency-name .currency-symbol as currencySymbol': [],
                'table#currencies tr .currency-name .currency-name-container as currencyName': [],
                'table#currencies tr .price as currencyPrice': [],
                'table#currencies tr > [data-timespan="24h"] as currencyPercent24h':
                    {
                        'type':
                            [],
                        'attr':
                            'data-percentusd'
                    }
            }
        }
    };

(async() => {
    const fetchbot = new FetchBot(job, {headless: true})
    fetchBotData = await fetchbot.run()

spinner.stop()

displayHeader()
displayTable()

function buildTable() {
    const cliTable = new Table({
        head: ['Sorting', 'Symbol', 'Name', 'Price', 'Change 24 h']
    })

    var upperLimit = (fetchBotData.currencySorting < 10) ? fetchBotData.currencySorting.length : 10;

    for (var i = 0; i < upperLimit; i++) {
        cliTable.push([
            fetchBotData.currencySorting[i],
            fetchBotData.currencySymbol[i],
            fetchBotData.currencyName[i],
            fetchBotData.currencyPrice[i],
            renderColorfulPercentage(parseFloat(fetchBotData.currencyPercent24h[i]).toFixed(2))
        ])
    }

    return cliTable.toString()
}

function displayTable() {
    console.log(buildTable())
}

function renderColorfulPercentage(percentValue) {
    let renderValue = chalk.green(percentValue)

    if (percentValue < 0) {
        renderValue = chalk.red(percentValue)
    }
    return renderValue + ' %'
}

function displayHeader() {
    console.log('Market Cap: ' + fetchBotData.marketCap)
    console.log('24h Vol: ' + fetchBotData.marketVol)
    console.log('BTC Dominance: ' + fetchBotData.btcDominance + ' %')
}
})()
