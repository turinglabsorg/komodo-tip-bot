//BTC lib.
var axios = require('axios')
//BTC RPC Client.
var client;

//RAM cache of all the TXs.
var txs;

//Creates a new address.
async function createAddress() {
    var address = await client.getNewAddress();
    return address;
}

//Gets an address's transactions.
async function getTransactions(address) {
    return txs[address];
}

//Gets an address's balance.
async function getBalance(address) {
    return new Promise(async response => {
        var unspent = await client.listUnspent(0);
        var balance = 0
        for(var i = 0; i < unspent.length; i++){
            var utxo = unspent[i]
            if(utxo.address === address && utxo.spendable === true){
                balance += utxo.amount
            }
        }
        response(balance)
    })
}

async function listReceived(address) {
    return new Promise(async response => {
        var unspent = await client.listReceivedByAddress();
        var balance = 0
        for(var i = 0; i < unspent.length; i++){
            var utxo = unspent[i]
            if(utxo.address === address){
                balance += utxo.amount
            }
        }
        response(balance)
    })
}

async function checkSender(tx, debug = false){
    var sender = tx.address
    var rawtransaction = await client.getRawTransaction(tx.txid)
    tx = await client.decodeRawTransaction(rawtransaction)
    vinvout = tx.vin[0].vout
    var vinraw = await client.getRawTransaction(tx.vin[0].txid)
    var vintx = await client.decodeRawTransaction(vinraw)

    if(vintx.vout[vinvout].scriptPubKey.addresses.indexOf(sender) !== -1){
        return true
    }
    return false
}

//Fix amount if is change transaction
async function fixAmountSend(address, tx, amount){
    var rawtransaction = await client.getRawTransaction(tx.txid)
    tx = await client.decodeRawTransaction(rawtransaction)

    var totalinputs = 0
    for(var i=0; i < tx.vin.length; i++){
        var vinraw = await client.getRawTransaction(tx.vin[i].txid)
        var vintx = await client.decodeRawTransaction(vinraw)
        for(var ix=0; ix < tx.vin.length; ix++){
            if(vintx.vout[tx.vin[ix].vout].scriptPubKey.addresses){
                if(vintx.vout[tx.vin[ix].vout].scriptPubKey.addresses.indexOf(address) !== -1){
                   totalinputs += vintx.vout[tx.vin[ix].vout].value
                }
            }
        }
    }
    
    if(totalinputs > 0){
        var sent = totalinputs - amount
        return sent
    }

    return false
}

//Sends amount to address.
async function send(sender, address, amount) {
    try {
        amount = parseFloat(amount)
        var unspent = await client.listUnspent(0);
        var inputs = []
        var inputamount = 0
        for(var i = 0; i < unspent.length; i++){
            var utxo = unspent[i]
            if(utxo.address === sender && utxo.spendable === true){
                if(inputamount < amount){
                    inputs.push(utxo)
                    inputamount += utxo.amount
                }
            }
        }
        if(inputamount >= amount){
            //Creating raw transaction
            var changeamount = inputamount - amount - process.settings.coin.withdrawFee
            changeamount = changeamount.toFixed(8)
            var outputs = {}
            outputs[address] = parseFloat(amount)
            if(changeamount > 0 && changeamount > 0.0001){
                outputs[sender] = parseFloat(changeamount)
            }
            var rawtransaction = await client.createRawTransaction(inputs, outputs);

            //Signin raw transaction
            var signed = await client.signRawTransaction(rawtransaction);
            if(signed.complete === true){
                //Sending raw transaction
                var txid = await client.sendRawTransaction(signed.hex);
                return txid
            }else{
                return false
            }
        }else{
            return false
        }
    } catch(e) {
        console.log(e)
        return false;
    }
}

module.exports = async () => {
    //Create the client.
    client = process.core.komodo

    //Init the TXs RAM cache.
    txs = {};

    //Get all the TXs the client is hosting, and sort them by address.
    async function getTXs(mode = 'hard') {
        var txsTemp
        txs = {}
        if(mode !== 'light'){
            txsTemp = await client.listTransactions("",9999999);
        }else{
            txsTemp = await client.listTransactions();
        }
        //Iterate through each TX.
        for (var i in txsTemp) {
            //If the TX has a new address, init the new array.
            if (typeof(txs[txsTemp[i].address]) === "undefined") {
                txs[txsTemp[i].address] = [];
            }
            txs[txsTemp[i].address].push(txsTemp[i]);
        }
    }
    //Do it every ten seconds.
    setInterval(getTXs, 10 * 1000);
    //Run it now so everything is ready.
    await getTXs('hard');

    //Return the functions.
    return {
        createAddress: createAddress,
        getTransactions: getTransactions,
        getBalance: getBalance,
        listReceived: listReceived,
        send: send,
        checkSender: checkSender,
        fixAmountSend: fixAmountSend
    };
};
