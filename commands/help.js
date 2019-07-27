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

\`\`\`` + botsymbol + ` withdraw <AMOUNT>|<all> <ADDRESS>\`\`\` 
**Withdraws** AMOUNT (or all) to ADDRESS, charging a ` + fee + ` `+ process.settings.coin.symbol +` fee. 

\`\`\`` + botsymbol + ` rain <AMOUNT>\`\`\` 
**Rain** the AMOUNT divided by all the online users. 

\`\`\`` + botsymbol + ` deposit\`\`\`

Prints your personal reusable deposit **address**.`

module.exports = async (client, msg) => {
    console.log('Help requested from user #' + msg.sender)
    process.core.router.pm(client, {
        embed: {
            description: help
        }
    }, msg);
};
