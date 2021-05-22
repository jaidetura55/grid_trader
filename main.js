"use strict";

var ccxt = require("ccxt");
var config = require("./setting.json");
const GridTrader = require("./utils/grid").Grid_trader;

// Classes Declaration

// Main function
(async function () {
  const LOGFILE = config.LOGFILE;
  const exchange = new ccxt.ftx({
    verbose: false,
    apiKey: config.apiKey,
    secret: config.secret,
    enableRateLimit: true,
    headers: {
      "FTX-SUBACCOUNT": config.sub_account,
    },
  });

  let markets = await exchange.loadMarkets();

  let main_job = new GridTrader(
    exchange,
    config.symbol,
    markets,
    config.grid_level,
    config.lower_price,
    config.upper_price,
    config.amount
  );

  main_job.place_order_init();
})();
