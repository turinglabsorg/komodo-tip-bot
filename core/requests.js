//MySQL and BN libs.
var BN = require("bignumber.js");
var PouchDB = require("pouchdb");
const uuidv4 = require('uuid/v4');

//Create user's request
async function create(user, address, amount, coins, client) {
    return new Promise(async response => {
        let id = uuidv4();
        let request = {
            user: user,
            client: client,
            address: address,
            timestamp: new Date().getTime(),
            amount: parseFloat(amount),
            coins: coins,
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
                let balance = await process.core.coin.listReceived(request.address)
                if(balance > 0){
                    request.received = balance
                    if(balance >= parseFloat(request.amount)){
                        request.state = 'filled'
                    }
                    await db.put(request)
                }
            }

            //Expires the request
            if(request.state !== 'expired'){
                let now = new Date().getTime()
                let elapsed = (now - request.timestamp) / 1000
                let days = elapsed / 60 / 60 / 24
                if(days >= 7){
                    request.state = 'expired'
                    await db.put(request)
                }

                //Check if there's balance and send the coin to the user.
                let balance = await process.core.coin.getBalance(request.address)
                if(balance > 0){
                    var user = await process.core.users.findUser(request.user, request.client);
                    let amount = BN(balance).minus(BN(process.settings.coin.withdrawFee));
                    var hash = await process.core.coin.send(request.address, user.address, amount);
                    console.log('Sending '+ amount +' back to the user, txid is: ' + hash)
                }

            }
        }
        response(true) 
    })
}

//Return a request
async function search(opid) {
    return new Promise(async response => {
        var db = new PouchDB('requests')
        let request = await db.get(opid)
        request.received = await process.core.coin.listReceived(request.address)
        await db.put(request)
        response(request) 
    })
}

//Withdraw from a request
async function withdraw(opid) {
    return new Promise(async response => {
        var db = new PouchDB('requests')
        let request = await db.get(opid)
        request.state = 'closed'
        if(request.address){
            let balance = await process.core.coin.getBalance(request.address)
            if(balance > 0){
                var user = await process.core.users.findUser(request.user, request.client);
                let amount = BN(request.received).minus(BN(process.settings.coin.withdrawFee));
                var hash = await process.core.coin.send(request.address, user.address, amount);
                console.log('Sending back to the user.')
            }
            await db.put(request)
            response({
                balance: balance,
                txid: hash
            })
        }else{
            response(false)
        }
    })
}

module.exports = async () => {
    setInterval(function(){
        console.log('Checking all the requests..')
        check()
    }, 60000)
    //Return all the functions.
    return {
        create: create,
        check: check,
        search: search,
        withdraw: withdraw
    };
};
