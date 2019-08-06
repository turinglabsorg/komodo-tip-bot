const axios = require('axios')
module.exports = async (client, msg) => {

    if (msg.text.length >= 3) {
        if(msg.text[1] !== 'check' && msg.text[1] !== 'withdraw'){
            let address = await process.core.komodo.getNewAddress()
            let amount = parseFloat(msg.text[1])
            if(amount <= 0){
                process.core.router.reply(client, "The amount is invalid.", msg)
                return
            }
            console.log('Requested payment address for user #' + msg.sender)
            let currency = 'usd'
            if(msg.text[2] !== undefined){
                currency = msg.text[2]
            }

            let price = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids='+process.settings.coin.coingecko+'&vs_currencies=' + currency)
            let pricecurrency = price.data[process.settings.coin.coingecko][currency]
            let coins = amount / pricecurrency

            let id = await process.core.requests.create(msg.sender, address, amount, coins, client)

            process.core.router.reply(client, "You requested `" + amount + " " + currency.toUpperCase() + "` changing at `" + price.data[process.settings.coin.coingecko][currency] + ' ' + currency.toUpperCase() +"`.\r\nPlease send `"+ coins +" "+process.settings.coin.symbol+"` at address:```" + address + '```Operation ID is: ```' + id + '```', msg)
        }else if(msg.text[1] === 'check'){
            let request = await process.core.requests.search(msg.text[2])
            process.core.router.reply(client, "Your address have been filled with `"+request.received+" "+ process.settings.coin.symbol +"` upon `"+request.coins+" "+ process.settings.coin.symbol +"` requested.", msg)
        }else if(msg.text[1] === 'withdraw'){
            let request = await process.core.requests.withdraw(msg.text[2])
            if(request !== false){
                if(request.balance > 0){
                    process.core.router.reply(client, "Your address have a balance of `"+request.balance+" "+ process.settings.coin.symbol +"` and the coins have been sent to your main address. Here's the TXID: `"+request.txid+"`", msg)
                }else{
                    process.core.router.reply(client, "Your address have a balance of `"+request.balance+" "+ process.settings.coin.symbol +"`, there's nothing to withdraw!", msg)
                }
            }else{
                process.core.router.reply(client, "We can't find the request.", msg)
            }
        }
    }else{
        process.core.router.reply(client, "You used the wrong amount of arguments, use `<AMOUNT> <CURRENCY>` or `CHECK <OPID>`.", msg);
        return;
    }
};