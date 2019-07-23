process.client = {};

async function connectdiscord() {
    //Connect to Discord
    process.client.discord = new (require("discord.js")).Client();
    process.client.discord.on("message", msg => {
        process.handleMessage(msg, 'discord')
    });
    process.client.discord.on("messageUpdate", async (oldMsg, msg) => {
        process.handleMessage(msg, 'discord')
    });
    process.client.discord.login(process.settings.discord.token)
}

module.exports = async () => {
    return {
        connectdiscord: connectdiscord
    };
};