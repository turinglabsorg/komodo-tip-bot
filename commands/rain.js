//BN lib.
var BN = require("bignumber.js");
BN.config({
    ROUNDING_MODE: BN.ROUND_DOWN,
    EXPONENTIAL_AT: process.settings.coin.decimals + 1
});

//Vars from the settings.
var symbol = process.settings.coin.symbol;

module.exports = async (client, msg) => {
    console.log('Tip command requested')
    //Tip from an user.
    if (msg.text.length === 2) {
        var from, amount, role;
        console.log('Rain requested from user #' + msg.sender)
        from = msg.sender;
        amount = msg.text[1]
        role = msg.text[2]

        if(amount <= 0) {
            process.core.router.reply(client, "Amount is invalid.", msg);
            return;
        }

        amount = BN(BN(amount).toFixed(process.settings.coin.decimals));

        if (!(await process.core.users.subtractBalance(from, amount, client))) {
            //If that failed...
            process.core.router.reply(client, "Your number is either invalid, negative, or you don't have enough.", msg);
            return;
        }

        var rainusers = [] 
        var rainusersid = [] 

        if(client === 'discord'){
            process.client.discord.users.map(user => {
                if(user.bot === false && user.id !== from){
                    if(rainusersid.indexOf(user.id) === -1){
                        rainusers.push(user)
                        rainusersid.push(user.id)
                    }
                }
            });

            let fees = rainusers.length * process.settings.coin.withdrawFee
            let amountavailable = amount - fees
            var amountperuser = (amountavailable / rainusers.length).toFixed(process.settings.coin.decimals)
            var sender = await process.core.users.findUser(from, client)
            var sent = 0 
            var tagusers = []
            var x=0 
            for(let u in rainusers){
                let to = rainusers[u].id
                if(!tagusers[x]){
                    tagusers[x] = ''
                }
                if(tagusers[x].length < 1500){
                    tagusers[x] += '<@' + rainusers[u].id + '> '
                }else{
                    x++
                    tagusers[x] = ''
                    tagusers[x] += '<@' + rainusers[u].id + '> '
                }
                if(to !== from){
                    var receiver = await process.core.users.findUser(to, client);
                    if(receiver === false){
                        await process.core.users.create(to, client)
                        receiver = await process.core.users.findUser(to, client)
                    }
                    var hash = await process.core.coin.send(sender.address, receiver.address, amountperuser);
                    sent++
                }
            }
        }

        process.core.router.reply(client, 'You rained ' + amountperuser + ' ' + symbol + ' to:', msg);
        for(let t in tagusers){
            let message = tagusers[t]
            process.core.router.reply(client, message, msg);
        }

    }else{
        process.core.router.reply(client, "You used the wrong amount of arguments.", msg);
        return;
    }
};