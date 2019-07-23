//Get variables from the settings.
var bot = process.settings.discord.user;
var symbol = process.settings.coin.symbol;
var decimals = process.settings.coin.decimals;
var fee = process.settings.coin.withdrawFee;
var botsymbol = process.settings.discord.symbol;

//Default staking tect.
var staking = `
**WALLET STAKING STATUS**

`;

process.core.coin.getStakingStatus().then(walletstatus => {
    staking += walletstatus['staking status']
})

module.exports = async (msg) => {
    msg.obj.author.send({
        embed: {
            description: staking
        }
    });
};
