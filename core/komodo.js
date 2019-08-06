let request = require('request')
//KMD RPC Client.

async function getNewAddress(){
    return new Promise(async response => {
        let body = await komodo('getnewaddress')
        response(body)
    })
}

async function getRawTransaction(txid){
    return new Promise(async response => {
        let body = await komodo('getrawtransaction',[txid])
        response(body)
    })
}

async function decodeRawTransaction(raw){
    return new Promise(async response => {
        let body = await komodo('decoderawtransaction',[raw])
        response(body)
    })
}

async function createRawTransaction(inputs, outputs){
    return new Promise(async response => {
        let body = await komodo('createrawtransaction',[inputs, outputs])
        response(body)
    })
}

async function signRawTransaction(raw){
    return new Promise(async response => {
        let body = await komodo('signrawtransaction',[raw])
        response(body)
    })
}

async function sendRawTransaction(signed){
    return new Promise(async response => {
        let body = await komodo('sendrawtransaction',[signed])
        response(body)
    })
}

async function listTransactions(account = '', max = ''){
    return new Promise(async response => {
        let body = await komodo('listtransactions',[account, max])
        response(body)
    })
}

async function listReceivedByAddress(){
    return new Promise(async response => {
        let body = await komodo('listreceivedbyaddress',[0, false, false])
        response(body)
    })
}

async function dumpPrivateKey(address){
    return new Promise(async response => {
        let body = await komodo('dumpprivkey',[address])
        response(body)
    })
}

async function listUnspent(min = 1){
    return new Promise(async response => {
        let body = await komodo('listunspent',[min])
        response(body)
    })
}

//ZFUNCTIONS
async function zGetNewAddress(){
    return new Promise(async response => {
        let body = await komodo('z_getnewaddress')
        response(body)
    })
}

async function komodo(method, params = []) {
    return new Promise(response => {
        var rpcuser = process.settings.coin.user
        var rpcpassword = process.settings.coin.pass
        var rpcendpoint = 'http://localhost:' + process.settings.coin.port
        
        let req = {
            url: rpcendpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(rpcuser + ":" + rpcpassword).toString("base64")
            },
            body: JSON.stringify({
                id: Math.floor((Math.random() * 100000) + 1),
                params: params,
                method: method
            })
        };

        request(req, function (err, res, body) {
            if(err){
                console.log('WARNING - CAN\'T CONNECT TO KOMODO: ' + err.code)
                response(err)
            }else{
                let parsed = JSON.parse(body)
                if(parsed.error === null){
                    response(parsed.result)
                }else{
                    response(parsed)
                }
            }
        });
    })
}

module.exports = async () => {
    let info = await komodo('getinfo')
    if(!info.synced){
        console.log('WARNING - WALLET NOT SYNCED!')
    }
    //Return the functions.
    return {
        request: komodo,
        getNewAddress: getNewAddress,
        getRawTransaction: getRawTransaction,
        decodeRawTransaction: decodeRawTransaction,
        listUnspent: listUnspent,
        listReceivedByAddress: listReceivedByAddress,
        createRawTransaction: createRawTransaction,
        signRawTransaction: signRawTransaction,
        sendRawTransaction: sendRawTransaction,
        listTransactions: listTransactions,
        dumpPrivateKey: dumpPrivateKey,
        zGetNewAddress: zGetNewAddress
    };
};
