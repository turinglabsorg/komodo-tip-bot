module.exports = async (msg, client) => {
    if (!(await process.core.users.getAddress(msg.sender, client))) {
        await process.core.users.setAddress(msg.sender, await process.core.coin.createAddress(msg.sender), client);
    }

    msg.obj.reply("Your reusable address is " + await process.core.users.getAddress(msg.sender, client));
};
