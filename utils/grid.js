class Oreder_Info {
  constructor() {
    this.done = false;
    this.side = null;
    this.id = 0;
  }
}
class Grid_trader {
  order_list = [];

  constructor(
    exchange,
    symbol,
    markets,
    grid_level = 0,
    lower_price = 0.0,
    upper_price = 0.0,
    amount = 0,
    postOnly = false
  ) {
    this.exchange = exchange;
    this.symbol = symbol;
    this.markets = markets;
    this.order_min_inteval = markets[this.symbol]["info"]["priceIncrement"];
    this.grid_level = grid_level;
    this.lower_price = lower_price;
    this.upper_price = upper_price;
    this.amount = amount;

    this.inteval_profit =
      (this.upper_price - this.lower_price) / this.grid_level;
    this.postOnly = postOnly;
  }

  // List of functions
  test() {
    return this.inteval_profit;
  }

  togglePostValue(value) {
    this.postOnly = value;
  }

  async place_order_init() {
    //start cal level and place grid oreder
    try {
      for (var i = 0; i < this.grid_level + 1; i++) {
        // n+1 lines make n grid
        let price = this.lower_price + i * this.inteval_profit;
        let ticker = await this.send_request("get_bid_ask_price", "", "");
        console.log(ticker);
        let bid_price = ticker["bid"];
        let ask_price = ticker["ask"];
        let order = new Oreder_Info();
        console.log("PRICE", price);
        console.log("ASK_PRICE", ask_price);
        if (price < ask_price) {
          order.id = this.send_request("place_order", "buy", price);
        } else {
          order.id = this.send_request("place_order", "sell", price);

          this.order_list.push(order);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  async send_request(task, input1 = {}, input2 = {}) {
    try {
      console.log("TAASK", task);
      let ticker;
      let tries = 3;

      if (
        task.toUpperCase().trim() === "get_bid_ask_price".toUpperCase().trim()
      ) {
        console.log("HERE", 1);
        ticker = await this.exchange.fetchTicker(this.symbol);
        return ticker;
      } else if (
        task.toUpperCase().trim() === "get_order".toUpperCase().trim()
      ) {
        console.log("HERE", 2);
        return await this.exchange.fetchOrder(input1)["info"];
      } else if (
        task.toUpperCase().trim() == "place_order".toUpperCase().trim()
      ) {
        console.log("HERE", 3);
        //send_request(self,task,input1=side,input2=price)
        let side = input1;
        let price = input2;
        let orderid = 0;
        let params = {
          externalReferralProgram: "compendiumfi",
          postOnly: this.postOnly,
        };
        if (side == "buy") {
          console.log("BUY");
          let result = await this.exchange.createLimitBuyOrder(
            this.symbol,
            this.amount,
            params
          );

          orderid = result["info"]["id"];
        } else {
          let result = await this.exchange.createLimitSellOrder(
            this.symbol,
            this.amount,
            price
          );
          console.log("RESULT", orderid);
          orderid = result["info"]["id"];
        }
        return orderid;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}

module.exports = { Grid_trader };
