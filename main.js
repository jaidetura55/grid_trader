"use strict";

var ccxt = require ('ccxt')
var config = require('./setting.json');

// Classes Declaration
class Oreder_Info {
    constructor() {
        this.done=false
        this.side=null
        this.id=0
    }
}
class Grid_trader {
   order_list=[]

    constructor(exchange, symbol,markets, grid_level=0,lower_price=0.0,upper_price=0.0,amount=0) {
      this.exchange = exchange;
      this.symbol = symbol;
      this.markets = markets;
      this.order_min_inteval = markets[this.symbol]["info"]["priceIncrement"]
      this.grid_level = grid_level;
      this.lower_price = lower_price;
      this.upper_price = upper_price;
      this.amount = amount
      this.inteval_profit = (this.upper_price - this.lower_price) / this.grid_level
    }

    // List of functions
    test () {
        return this.inteval_profit
    }

    async place_order_init () {
        //start cal level and place grid oreder
        for (var i = 0; i < this.grid_level +1; i++) { // n+1 lines make n grid
            let price = this.lower_price + i * this.inteval_profit
            let ticker = this.send_request("get_bid_ask_price")
            console.log(ticker)
            let bid_price =  ticker["bid"]
            let ask_price =  ticker["ask"]
            let order = new Oreder_Info()

            if (price < ask_price) {
                order.id = this.send_request("place_order","buy",price)
               // console.log("place buy order id = " + order.id + " in "+ price)
            } 
            else {
                order.id = this.send_request("place_order","sell",price)
             //   console.log("place sell order id = " + order.id + " in "+ price)
                this.order_list.push(order)
            }

          }
    }


    async send_request (task, input1,input2) {
        let tries = 3
        for (var i; i < tries; i++) {
            if (task == "get_bid_ask_price") {
                ticker =  await this.exchange.fetch_ticker(this.symbol)
                return ticker  
            }

            else if (task == "get_order") {
                return self.exchange.fetchOrder(input1)["info"]
            }

            else if (task == "place_order") {
                //send_request(self,task,input1=side,input2=price)
                let side = input1
                let price = input2
                let orderid=0
                if(side =="buy") {
                    orderid = this.exchange.create_limit_buy_order(this.symbol,this.amount,price )["info"]["id"]
                }
                else{
                    orderid = this.exchange.create_limit_sell_order(this.symbol,this.amount,price )["info"]["id"]               
                }
                return orderid
            }
            else{
                return null
            }

        }
    }

  }



// Main function
(async function () {

const LOGFILE= config.LOGFILE
const exchange  = new ccxt.ftx({
    'verbose': false,
    'apiKey': config.apiKey,
    'secret': config.secret,
    'enableRateLimit': true,
    'headers': {
        'FTX-SUBACCOUNT': config.sub_account,
    },
})

let markets = await exchange.loadMarkets ()
let main_job = new Grid_trader(exchange,config.symbol,markets,config.grid_level,config.lower_price,config.upper_price,config.amount)

console.log(main_job.test())
//main_job.place_order_init()

}) ();