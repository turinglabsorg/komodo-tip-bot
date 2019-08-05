//MySQL and BN libs.
var BN = require("bignumber.js");
var PouchDB = require("pouchdb");
const uuidv4 = require('uuid/v4');

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

//Create user's request
async function create(user, address, amount) {
    return new Promise(async response => {
        let id = uuidv4();
        let request = {
            user: user,
            address: address,
            timestamp: new Date().getTime(),
            amount: amount,
            received: 0,
            state: 'pending',
            _id: id
        }
    
        var db = new PouchDB('requests')
        await db.put(request)
        response(id) 
    })
}

//Check all requests
async function check() {
    return new Promise(async response => {
        var db = new PouchDB('requests')
        var requests = await db.allDocs()
        for(var i = 0; i < requests.rows.length; i++){
            let entry = requests.rows[i]
            let request = await db.get(entry.id)
            if(request.state === 'pending'){
                //console.log(request)
            }
        }
        response(true) 
    })
}

module.exports = async () => {

    //Return all the functions.
    return {
        create: create,
        check: check
    };
};
