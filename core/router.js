module.exports = {
    discord: function() {
        //Create a Discord process.client.
        process.client['discord'] = new (require("discord.js")).Client();
        process.client['discord'].on("message", process.handleMessage('discord'));
        process.client['discord'].on("messageUpdate", async (oldMsg, msg) => {
            handleMessage('discord',msg);
        });
        process.client['discord'].login(process.settings.discord.token);
    }
};