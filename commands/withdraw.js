//BN lib.
var BN = require("bignumber.js");
BN.config({
    ROUNDING_MODE: BN.ROUND_DOWN,
    EXPONENTIAL_AT: process.settings.coin.decimals + 1
});

var symbol = process.settings.coin.symbol;

module.exports = async (client, msg) => {
    //Check the argument count.
    if (msg.text.length !== 3) {
        process.core,router.reply(client, "You used the wrong amount of arguments.", msg);
        return;
    }

    //Get the amount from the command.
    var amount = msg.text[1];
    //Amount with the withdrawl fee.
    var amountWFee;

    //If the amount is all...
    if (amount === "all") {
        //The amount with the fee is the user's balance.
        amountWFee = await process.core.users.getBalance(msg.sender, client);
        //The amount is the balance minus the fee.
        amount = BN(amountWFee).minus(BN(process.settings.coin.withdrawFee));      
    //Else...
    } else {
        //Parse the amount (limited to the satoshi), and add the withdraw fee.
        amount = BN(BN(amount).toFixed(process.settings.coin.decimals));
        amountWFee = amount.plus(BN(process.settings.coin.withdrawFee));
    }

    //Get the address by filtering the message again, but not calling toLowerCase this time since addresses are case sensitive.
    var address = msg.obj.content
        .split(" ").filter((item) => {
            return item !== "";
        }).join(" ")
        .substring(1, msg.obj.content.length)
        .replace(new RegExp("\r", "g"), "")
        .replace(new RegExp("\n", "g"), "")
        .split(" ")[3];

    //If we were unable to subtract the proper amount...
    if (!(await process.core.users.subtractBalance(msg.sender, amountWFee, client))) {
        process.core.router.reply(client, "Your number is either invalid, negative, or you don't have enough. Remember, you must also have extra " + symbol + " to pay the fee.", msg);
        return;
    }

    //If we made it past the checks, send the funds.
    var userDB = await process.core.users.findUser(msg.sender, client)
    if(userDB === false){
        await process.core.users.create(msg.sender, client)
        userDB = await process.core.users.findUser(msg.sender, client)
    }
    var senderaddress = userDB.address
    var hash = await process.core.coin.send(senderaddress, address, amount);
    
    if (typeof(hash) !== "string") {
        process.core.router.reply(client, "Our node failed to create a TX! Is your address invalid?", msg);
        return;
    }
    
    if (hash.length !== 64) {
        process.core.router.reply(client, "Our node failed to create a TX! Is your address invalid?", msg);
        return;
    }
    
    process.core.router.reply(client, "Success! Your TXID is " + hash + ".", msg);
};
