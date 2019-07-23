//BTC lib.
var bitcoin = require("bitcoin-core");
var axios = require('axios')
//BTC RPC Client.
var client;

//RAM cache of all the addresses and TXs.
var addresses, txs;

//Creates a new address.
async function createAddress() {
    var address = await client.getNewAddress();
    addresses.push(address);
    return address;
}

async function ownAddress(address) {
    return addresses.indexOf(address) !== -1;
}

//Gets an address's transactions.
async function getTransactions(address) {
    return txs[address];
}

async function listUnspent(address) {
    return await client.listUnspent();
}

async function getStakingStatus() {
    var rpcuser = process.settings.coin.user
    var rpcpassword = process.settings.coin.pass
    
    var response = 
    await axios.post(
        'http://localhost:42223',
        {
            id: Math.floor((Math.random() * 100000) + 1),
            params: [],
            method: 'getstakingstatus'
        },
        {
            headers: { Authorization: 'Basic ' + Buffer.from(rpcuser + ":" + rpcpassword).toString("base64") }
        }
    ).catch(err => {
        return err
    })
    return response.data.result
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

//Get staking reward
async function getStakingReward(tx, address){
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
    
    var totaloutputs = 0
    for(var i=0; i < tx.vout.length; i++){
        var vout = tx.vout[i]
        if(vout.scriptPubKey.addresses){
            if(vout.scriptPubKey.addresses.indexOf(address) !== -1){
                totaloutputs += vout.value
            }
        }
    }
    var stakingreward = totaloutputs - totalinputs
    stakingreward = parseFloat(stakingreward.toFixed(8))
    return stakingreward
}

//Sends amount to address.
async function send(sender, address, amount) {
    try {
        amount = parseFloat(amount)
        var unspent = await client.listUnspent(0,99999);
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
            var outputs = {}
            outputs[address] = parseFloat(amount),
            outputs[sender] = parseFloat(changeamount)
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
    client = new bitcoin({
        host: "localhost",
        port: process.settings.coin.port,
        username: process.settings.coin.user,
        password: process.settings.coin.pass
    });

    //Init the addresses array.
    addresses = [];
    //Init the TXs RAM cache.
    txs = {};

    //Get all the TXs the client is hosting, and sort them by address.
    async function getTXs(mode = 'hard') {
        var txsTemp
        txs = {}
        if(mode !== 'light'){
            txsTemp = await client.listTransactions("",99999999999);
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

    //Get each address and add it to the address array.
    var temp = await client.listReceivedByAddress(0, true);
    for (var i in temp) {
        addresses.push(temp[i].address);
    }

    //Return the functions.
    return {
        createAddress: createAddress,
        ownAddress: ownAddress,
        getTransactions: getTransactions,
        send: send,
        listUnspent: listUnspent,
        checkSender: checkSender,
        fixAmountSend: fixAmountSend,
        getStakingStatus: getStakingStatus,
        getStakingReward: getStakingReward
    };
};
