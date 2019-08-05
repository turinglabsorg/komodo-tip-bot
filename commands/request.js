const axios = require('axios')
module.exports = async (client, msg) => {

    if (msg.text.length >= 3) {
        if(msg.text[1] !== 'check'){
            let address = await process.core.komodo.getNewAddress()
            let amount = msg.text[1]
            console.log('Requested payment address for user #' + msg.sender)
            let id = await process.core.requests.create(msg.sender, address, amount)
            let currency = 'usd'
            if(msg.text[2] !== undefined){
                currency = msg.text[2]
            }

            let price = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids='+process.settings.coin.coingecko+'&vs_currencies=' + currency)
            let pricecurrency = price.data[process.settings.coin.coingecko][currency]
            let amountcurrency = amount / pricecurrency
            process.core.router.reply(client, "You requested `" + amount + " " + currency.toUpperCase() + "` changing at `" + price.data[process.settings.coin.coingecko][currency] + ' ' + currency.toUpperCase() +"`.\r\nPlease send `"+ amountcurrency +" "+process.settings.coin.symbol+"` at address:```" + address + '```Operation ID is: ```' + id + '```', msg)
        }else if(msg.text[1] === 'check'){
            // TODO
        }
    }else{
        process.core.router.reply(client, "You used the wrong amount of arguments, use `<AMOUNT> <CURRENCY>` or `CHECK <OPID>`.", msg);
        return;
    }
};