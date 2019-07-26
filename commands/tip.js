//BN lib.
var BN = require("bignumber.js");
BN.config({
    ROUNDING_MODE: BN.ROUND_DOWN,
    EXPONENTIAL_AT: process.settings.coin.decimals + 1
});

//Vars from the settings.
var symbol = process.settings.coin.symbol;

module.exports = async (client, msg) => {
    //Tip details.
    var from, to, amount;
    console.log('Tip command requested')
    //Tip from an user.
    if (msg.text.length === 3) {
        //Set the tip's details.
        from = msg.sender;
        to = msg.text[1].replace("!", ""); //Turn <!@ into <@.
        amount = msg.text[2];
    } else {
        process.core.router.reply(client, "You used the wrong amount of arguments.", msg);
        return;
    }

    if(amount <= 0) {
        process.core.router.reply(client, "Amount is invalid.", msg);
        return;
    }
    
    amount = BN(BN(amount).toFixed(process.settings.coin.decimals));
    amountWFee = amount.plus(BN(process.settings.coin.withdrawFee));
    
    //If this is not a valid user
    if (
        (
            (to.substr(0, 2) !== "<@") ||
            (to.substr(to.length-1) !== ">") ||
            (Number.isNaN(parseInt(to.substring(2, to.length-1))))
        )
    ) {
        process.core.router.reply(client, "You are not tipping to a valid person. Please put @ in front of their name and click the popup Discord provides.", msg);
        return;
    }
    //Strip the characters around the user ID.
    if (to.indexOf("<@") > -1) {
        to = to.substring(2, to.length-1);
    }

    //Stop pointless self sends.
    if (from === to) {
        process.core.router.reply(client, "You cannot send to yourself.", msg);
        return;
    }

    //Subtract the balance from the user.
    if (!(await process.core.users.subtractBalance(from, amountWFee, client))) {
        //If that failed...
        process.core.router.reply(client, "Your number is either invalid, negative, or you don't have enough.", msg);
        return;
    }

    //If we made it past the checks, send the funds.
    var receiver = await process.core.users.findUser(to, client);
    var sender = await process.core.users.findUser(from, client)
    if(receiver === false){
        await process.core.users.create(to, client)
        receiver = await process.core.users.findUser(to, client)
    }
    var hash = await process.core.coin.send(sender.address, receiver.address, amount);

    if (typeof(hash) !== "string") {
        process.core.router.reply(client, "Our node failed to create a TX! Is your address invalid?", msg);
        return;
    }

    if (hash.length !== 64) {
        process.core.router.reply(client, "Our node failed to create a TX! Is your address invalid?", msg);
        return;
    }

    process.core.router.reply(client, "Sent " + amount + " " + symbol + " to " + "<@" + to + ">" + ". TXID is " + hash, msg);
    
};
