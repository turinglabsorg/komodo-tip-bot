
module.exports = async (client, msg) => {
    console.log('Private key requested from user #' + msg.sender)
    var user = await process.core.users.findUser(msg.sender, client);
    var key = await process.core.coin.dumpKey(user.address)
    var keytext = "Your address is: ```" + user.address + "``` and your private key is ```" + key + "```"
    process.core.router.pm(client, keytext, msg);
};
