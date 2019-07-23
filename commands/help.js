//Get variables from the settings.
var bot = process.settings.discord.user;
var symbol = process.settings.coin.symbol;
var decimals = process.settings.coin.decimals;
var fee = process.settings.coin.withdrawFee;
var botsymbol = process.settings.discord.symbol;

//Default help tect.
var help = `To run a command, either preface it with ` + botsymbol + ` (` + botsymbol + `deposit, ` + botsymbol + `tip) 
This bot does use decimals, and has 8 decimals of accuracy. 

\`\`\`
` + botsymbol + `balance 
\`\`\`
Prints your **balance**. 

\`\`\`
` + botsymbol + `tip <@PERSON> <AMOUNT>
\`\`\`
**Tips** the person that amount of LYRA. 

\`\`\` 
` + botsymbol + `withdraw <AMOUNT> <ADDRESS>
\`\`\` 
**Withdraws** AMOUNT to ADDRESS, charging a 0.01 LYRA fee. 

\`\`\` 
` + botsymbol + `deposit 
\`\`\`
Prints your personal deposit **address**.`

module.exports = async (msg) => {
    msg.obj.author.send({
        embed: {
            description: help
        }
    });
};
