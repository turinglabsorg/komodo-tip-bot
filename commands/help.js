//Get variables from the settings.
var decimals = process.settings.coin.decimals;
var fee = process.settings.coin.withdrawFee;
var botsymbol = process.settings.discord.symbol;

//Default help tect.
var help = `To run a command, either preface it with ` + botsymbol + ` (ex. ` + botsymbol + ` deposit, ` + botsymbol + ` tip) 
This bot does use decimals, and has ` + decimals + ` decimals of accuracy. 

\`\`\`` + botsymbol + ` balance\`\`\`
Prints your **balance**. 

\`\`\`` + botsymbol + ` tip <@PERSON> <AMOUNT>\`\`\`
**Tips** the person that amount of `+ process.settings.coin.symbol +`. 

\`\`\`` + botsymbol + ` withdraw <AMOUNT> <ADDRESS>\`\`\` 
**Withdraws** AMOUNT to ADDRESS, charging a ` + fee + ` `+ process.settings.coin.symbol +` fee. 

\`\`\`` + botsymbol + ` deposit\`\`\`

Prints your personal reusable deposit **address**.`

module.exports = async (client, msg) => {
    process.core.router.pm(client, {
        embed: {
            description: help
        }
    }, msg);
};
