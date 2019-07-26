module.exports = async (client, msg) => {
    if (!(await process.core.users.getAddress(msg.sender, client))) {
        await process.core.users.setAddress(msg.sender, await process.core.coin.createAddress(msg.sender), client);
    }
    console.log('Requested deposit address for user #' + msg.sender)
    process.core.router.reply(client, "Your reusable address is " + await process.core.users.getAddress(msg.sender, client), msg);
};
