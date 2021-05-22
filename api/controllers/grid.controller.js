const CronJobManager = require("cron-job-manager");
const manager = new CronJobManager();
const ccxt = require("ccxt");
const GridClass = require("../../utils/grid").Grid_trader;

const addNewGrid = async (req, res) => {
  try {
    let {
      apiKey,
      secret,
      subAccount,
      symbol,
      gridLevel,
      lowerPrice,
      upperPrice,
      amount,
    } = req.body;
    const exchange = new ccxt.ftx({
      verbose: false,
      apiKey: apiKey,
      secret: secret,
      enableRateLimit: true,
      headers: {
        "FTX-SUBACCOUNT": subAccount,
      },
    });

    let markets = await exchange.loadMarkets();
    let main_job = new GridClass(
      exchange,
      symbol,
      markets,
      Number(gridLevel),
      Number(lowerPrice),
      Number(upperPrice),
      Number(amount),
    );
    let key = new String(apiKey);
    manager.add(key.trim(), "60 * * * * *", async () => {
      await main_job.place_order_init();
    });
    manager.start(key);
    res.json({
      success: true,
      message: "Grid Schedule Started",
    });
  } catch (error) {
    res.json({
      success: true,
      message: error.message,
    });
  }
};
const updateNewGrid = async (req, res) => {
  try {
    let {
      apiKey,
      secret,
      subAccount,
      symbol,
      gridLevel,
      lowerPrice,
      upperPrice,
      amount,
      postOnly,
    } = req.body;
    const exchange = new ccxt.ftx({
      verbose: false,
      apiKey: apiKey,
      secret: secret,
      enableRateLimit: true,
      headers: {
        "FTX-SUBACCOUNT": subAccount,
      },
    });

    let markets = await exchange.loadMarkets();
    let main_job = new GridClass(
      exchange,
      symbol,
      markets,
      Number(gridLevel),
      Number(lowerPrice),
      Number(upperPrice),
      Number(amount),
      postOnly
    );
    let key = new String(apiKey);
   
    manager.stop(key);
    manager.update(key, main_job.place_order_init());
    manager.start(key);
  
    res.json({
      success: true,
      message: "Grid Trader Updated",
    });
  } catch (error) {
    res.json({
      success: true,
      message: error.message,
    });
  }
};
const cancelOrders = async (req, res) => {
  try {
    let { apiKey, secret, subAccount } = req.body;
    const exchange = new ccxt.ftx({
      verbose: false,
      apiKey: apiKey,
      secret: secret,
      enableRateLimit: true,
      headers: {
        "FTX-SUBACCOUNT": subAccount,
      },
    });
    let result = await exchange.cancelAllOrders();
    res.json({
      success: true,
      message: result,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
const stopGrid = async (req, res) => {
  let { apiKey } = req.body;

  try {
    manager.stop(apiKey);
    res.json({
      success: true,
      message: "Grid Trader Stopped",
    });
  } catch (error) {
    console.log(`I got the current jobs: ${manager}`);
    res.json({
      success: true,
      message: error.message,
    });
  }
};

module.exports = { stopGrid, addNewGrid, cancelOrders, updateNewGrid };
