# Multichannel wallet Bot for Komodo based Asset Chains.

### A bot made for Discord, Twitter (soon), Telegram (soon) and more.

This code is based on kayabaNerve Tip Bot (https://github.com/kayabaNerve/tip-bot) with a lot of changes, from staking to true wallet management based on raw transactions. All references to ERC20 are removed.

To install the bot:
- Install Komodo and run your asset chain, then:
    - Edit the conf file to add `server=1`, `rpcuser=user`, and `rpcpass=pass` (with your own username and password).
    - Start the daemon.
    - Move `settings.example.json` to `settings.json`.
    - Edit the `settings.json` file's `coin` var to have:
        - `symbol` set to the coin's symbol ("BTC").
        - `decimals` set to the amount of the coin's decimals (8). Optionally, you may set a lower amount of decimals so users can't tip satoshis.
        - `port` set to the daemon's RPC port (8337).
        - `user` set to the username you set in the conf file ("user").
        - `pass` set to the password you set in the conf file ("pass").
- Create a Discord Bot User.
    - Go to https://discordapp.com/developers/applications/me.
    - Click `New App`.
    - Enter a name, and optionally, upload an icon.
    - Click `Create a Bot User`.
    - Grab the `Client ID` from the top, and go to this link: https://discordapp.com/oauth2/authorize?client_id=!!CLIENT_ID!!&scope=bot&permissions=68672, after replacing !!CLIENT_ID!! with the bot's client ID. This will allow you to add the bot to a server with the proper permissions of Read Messages/Send Messages/Add Reactions (the last one is only necessary if you use giveaways).
    - Edit the `settings.json` file's `discord` var to include:
        - `token` set to the bot user token. This is not the client user.
        - `user` set to the value gotten by right-clicking the bot on your server and clicking `Copy ID`. This requires `Developer Mode` to be enabled on your Discord client.
- Set up any channel locked commands in `settings.json`'s `commands` var.
    - If you wish to lock a command to a channel, edit `example` to be the name of the command, and `ROOM ID` to be the value gotten from right-clicking a room and clicking `Copy ID`. You can add multiple channel IDs to the array.
    - To setup more channel locks, simply copy the `example` template and fill it our properly.
- Install NodeJS dependencies via `npm i`.
    - `discord.js` will print several warnings about requiring a peer but none was installed. These are normal, and refer to optional packages for connecting to voice channels, something we don't do.

Want to donate? 
I accept BTC => 3G4oGSVuY2DmAUSzmvj8qJ7vd9KSaTR2NP
