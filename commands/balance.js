
module.exports = async (client, msg) => {
    //Tell the user their balance.
    process.core.router.reply(client, "You have " + (await process.core.users.getBalance(msg.sender)).toString() + " " + process.settings.coin.symbol + ".", msg);
};
