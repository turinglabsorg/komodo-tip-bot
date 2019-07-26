
module.exports = async (client, msg) => {
    //Tell the user their balance.
    console.log('Balance requested from user #' + msg.sender)
    process.core.router.reply(client, "You have " + (await process.core.users.getBalance(msg.sender, client)).toString() + " " + process.settings.coin.symbol + ".", msg);
};
