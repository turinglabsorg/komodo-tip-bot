//MySQL and BN libs.
var BN = require("bignumber.js");
var PouchDB = require("pouchdb");

BN.config({
    ROUNDING_MODE: BN.ROUND_DOWN,
    EXPONENTIAL_AT: process.settings.coin.decimals + 1
});

//RAM cache of users.
var users;

//Array of every handled TX hash.
var handled;

//Checks an amount for validity.
async function checkAmount(amount) {
    //If the amount is invalid...
    if(!amount){
        return false
    }
    //Else, return true.
    return true;
}

//Finds user in database
async function findUser(user, client){
    return new Promise(async response => {
        var db = new PouchDB('users');
        var dbcheck = await db.allDocs()
        var found = false
        for(var i = 0; i < dbcheck.rows.length; i++){
            let entry = dbcheck.rows[i]
            let userDB = await db.get(entry.id)
            if(userDB[client + '_id'] !== undefined && userDB[client + '_id'] === user){
                found = userDB
            }
        }
        response(found)
    })
}

//Creates a new user.
async function create(user, client) {
    //If the user already exists, return.
    return new Promise(async response => {

        let found = await findUser(user, client)

        if(found === false){
            let toStore = {}
            toStore[client + '_id'] = user
            toStore['address'] = ''
            toStore['notify'] = 0
    
            var db = new PouchDB('users')
            await db.post(toStore)
            let newAddress = await process.core.coin.createAddress()
            await setAddress(user, newAddress, client);
            response(true)
        }else{
            response(false)
        }
    })
}

//Sets an user's address.
async function setAddress(user, address, client) {
   let userDB = await findUser(user, client)
    if(userDB['address'] !== ''){
        return false
    }
    userDB.address = address

    var db = new PouchDB('users')
    await db.put(userDB)

    return true
}


//Subtracts from an user's balance.
async function subtractBalance(user, amount, client) {
    //Return false if the amount is invalid.

    amount = parseFloat(amount)
    if (!(await checkAmount(amount))) {
        return false;
    }

    if(amount <= 0){
        return false;
    }
    var balance = await getBalance(user, client)
    if(amount > balance){
        return false
    }
    return true;
}

//Calculate correct balance
async function fixBalance(user, client){
    let userDB = await findUser(user, client)
    var address = userDB.address
    if(address.length !== 34){
        return false;
    }
    var i;
    var balance = 0;
    var parsed = [];
    var unspent = await process.core.komodo.listUnspent(0);
    for(var i = 0; i < unspent.length; i++){
        var utxo = unspent[i]
        if(utxo.address === address && utxo.spendable === true){
            balance += utxo.amount
            parsed.push(utxo.txid)
        }
    }
    
    var txs = await process.core.coin.getTransactions(address);
    //console.log('PARSING TRANSACTIONS')
    //Iterate over the TXs.
    var i;
    for (i in txs) {
        if(txs[i].generated && txs[i].address === address && txs[i].confirmations < 60 && txs[i].category === "receive"){
            if(parsed.indexOf(txs[i].txid) === -1){
                balance += txs[i].amount 
            }
        }
    }

    balance = parseFloat(balance.toFixed(8))
    var db = new PouchDB('users');
    userDB.balance = balance
    await db.put(userDB)
}

//Updates the notify flag.
async function setNotified(user, client) {
    //Update the table with a turned off notify flag.
    let userDB = await findUser(user, client)
    userDB.notify = false
    var db = new PouchDB('users')
    await db.put(userDB)
}

//Returns an user's address.
async function getAddress(user, client) {
    let userDB = await findUser(user, client)
    return userDB.address;
}

//Returns an user's balance
async function getBalance(user, client) {
    await fixBalance(user, client)
    let userDB = await findUser(user, client)
    return parseFloat(userDB.balance.toFixed(8))
}

//Returns an user's notify flag.
async function getNotify(user, client) {
    let userDB = await findUser(user, client)
    return userDB.notify;
}

module.exports = async () => {
    //Connects to PouchDB.
    connection = new PouchDB('users')

    //Init the RAM cache.
    users = {};
    //Init the handled array.
    handled = [];
    //Gets every row in the table.
    var rows = await connection.allDocs()
    //Iterate over each row, creating an user object for each.
    var i;
    for (i in rows) {
        users[rows[i].name] = {
            //If the address is an empty string, set the value to false.
            //This is because we test if the address is a string to see if it's already set.
            address: (rows[i].address !== "" ? rows[i].address : false),
            //Set the balance as a BN.
            balance: BN(rows[i].balance),
            //Set the notify flag based on if the DB has a value of 0 or 1 (> 0 for safety).
            notify: (rows[i].notify > 0)
        };

    }

    //Return all the functions.
    return {
        create: create,
        setAddress: setAddress,
        subtractBalance: subtractBalance,
        setNotified: setNotified,
        getAddress: getAddress,
        getBalance: getBalance,
        getNotify: getNotify,
        findUser: findUser
    };
};

//Every five seconds, check the TXs of each user.
setInterval(async () => {
    for (var user in users) {
        //If that user doesn't have an address, continue.
        if (users[user].address === false || users[user].address === undefined) {
            continue;
        }

        await fixBalance(user).catch(err => {
            console.log(err)
        })
    }
}, 5 * 1000);