const web3Ctx = require('../web3/web3Ctx');
const common = require('../common/common');
const jsonPathLibrary = require('json-path-value');
const jsonPath = new jsonPathLibrary.JsonPath();
const inquirer = require('inquirer');
const fs = require('fs');
const prettyJson = require('prettyjson');
const qrcode = require('qrcode-terminal');
const RLP = require('rlp');
const _ = require( 'underscore');

const jsonPrintOptions = {
    noColor: false
};

//[SP1] Create a prepaid card
async function _sp1() {
    let cards = common.getCards();
    const ctx = web3Ctx.getCurrentContext();
    let questions = [
        { type: 'input', name: 'secret', message: 'Specify the secret key:' },
        { type: 'input', name: 'amount', message: 'Amount of tokens:' }
    ];    
    let answer = await inquirer.prompt(questions);
    let randomId = Math.floor(Math.random() * (Math.pow(2, 50) - 1)) + 1;

    return new Promise((resolve, reject) => {
        ctx.prepaidCardManager.methods.addCard(randomId, answer.amount, ctx.web3.utils.keccak256(answer.secret)).send(ctx.transactionObject)
        .on('transactionHash', (hash) => {
            web3Ctx.checkTransaction(hash).then( () => 
            {
                cards.push({ id: randomId, secret: answer.secret, active: false, points: answer.amount});
                common.setCards(cards); 
                resolve();
            }
            , (err) => reject(err));
        });
    });
}

//[SP2] Add vendor
async function _sp2() {
    console.log('VENDOR Address:', web3Ctx.contexts.VENDOR.address);
    const ctx = web3Ctx.getCurrentContext();
    let questions = [
        { type: 'input', name: 'vendor', message: 'Vendor Address:' }
    ];

    let answer = await inquirer.prompt(questions);
    
    
    let data = await ctx.prepaidCardManager.methods.isSigner(answer.vendor).call(ctx.transactionObject);
    console.log('isSigner:',data);

    return new Promise((resolve, reject) => {
        ctx.prepaidCardManager.methods.addSigner(answer.vendor).send(ctx.transactionObject)
        .on('transactionHash', (hash) => {
            web3Ctx.checkTransaction(hash).then( () => resolve(), (err) => reject(err));
        });
    });
}

//[SP3] Create Schema
async function _sp3() {
    let questions = [
        { type: 'input', name: 'schemaId', message: 'Schema id:' },
        { type: 'input', name: 'schemaValidityDays', message: 'Schema validity days:' },
        { type: 'input', name: 'schemaPrice', message: 'Schema price:' },
        { type: 'input', name: 'topPrize', message: 'Specify top Schema Price:', default: (answers) => answers.schemaPrice},
        { type: 'input', name: 'assetValidityDays', message: 'Asset validity days:' },
        { type: 'input', name: 'dappId', message: 'Specify the dappId:' }, 
    ]; 

    let answer = await inquirer.prompt(questions); 

    const pathValues = [];
    const schemaId=parseInt(answer.schemaId);

    let n =  Date.now();
    n = n / 1000;
    n += 60*60*24*parseInt(answer.schemaValidityDays); // schema valid for one year 
    n = Math.trunc(n);
    pathValues.push(n); // schema expiration date
    pathValues.push(schemaId); // id

    pathValues.push(parseInt(answer.schemaPrice)); // price >=0
    pathValues.push(60*60*24*parseInt(answer.assetValidityDays)); // asset valid for X days
    pathValues.push(answer.dappId); // dappId
    pathValues.push(parseInt(answer.topPrize)); // dappId

    let clearArray = await _getClearHouseArray();

    pathValues.push(clearArray);
    const encodedData = RLP.encode(pathValues);

    const ctx = web3Ctx.getCurrentContext();

    return new Promise((resolve, reject) => {
        ctx.schemas.methods.createSchema(schemaId,encodedData).send(ctx.transactionObject)
        .on('transactionHash', (hash) => {
            web3Ctx.checkTransaction(hash).then( () => resolve(), (err) => reject(err));
        });
    });
}

async function _getClearHouseArray() {
    const clearArray = [];
    let address = common.getAddress();
    const choices = [];
    address.forEach(item => {         
        choices.push({name: item.name +' '+ item.address,value: item});
    });

    let questions = [
        { type: 'list', name: 'percentage', message: 'Percentage', choices: ['10','19','20','25','21','30','31','40','41','50','60','90','100'] },
        { type: 'list', name: 'address', message: 'Address', choices: choices},
        { type: 'confirm', name: 'more', message: 'more?', default: false},
               
    ]; 

    let moreItems = true;
    while (moreItems){
        let answer = await inquirer.prompt(questions); 
        const clearItem=[];
        clearItem.push(parseInt(answer.percentage));
        clearItem.push(answer.address.address);
        clearItem.push(answer.address.name);

        clearArray.push(clearItem);

        moreItems = answer.more;
    }

    return clearArray;
}

//[SP4] List Schemas
async function _sp4() {    
  
    const ctx = web3Ctx.getCurrentContext();
    try {
        let schemas = await ctx.schemas.methods.getSchemas().call(ctx.transactionObject);
        console.log('Schemas:',schemas.map( item => Number(item)));
    } catch(e) {
        console.log('Error:',e);
    }   
}


//[SP5] Detail Schema
async function _sp5() {    
    let questions = [
        { type: 'input', name: 'schemaId', message: 'Schema id:' }
    ];    
    let answer = await inquirer.prompt(questions);

    const ctx = web3Ctx.getCurrentContext();
    try {
        let schema = await ctx.schemas.methods.getSchema(answer.schemaId).call(ctx.transactionObject);
        console.log('Schema:',schema);
    } catch(e) {
        console.log('Error:',e);
    }   
}

//[SP6] ON/OFF Schema
async function _sp6() {
    let questions = [
        { type: 'input', name: 'schemaId', message: 'Schema id:' },
        { type: 'list', name: 'status', message: 'Schema status:' , choices: ['enabled','disabled']},
    ];    
    let answer = await inquirer.prompt(questions);

    const ctx = web3Ctx.getCurrentContext();

    let operation = ctx.schemas.methods.validateSchema;
    
    if (answer.status == 'disabled') {
        operation = ctx.schemas.methods.invalidateSchema
    }

    return new Promise((resolve, reject) => {
        operation(answer.schemaId).send(ctx.transactionObject)
        .on('transactionHash', (hash) => {
            web3Ctx.checkTransaction(hash).then( () => resolve(), (err) => reject(err));
        });
    });

}

//[SP61] Delete Schema
async function _sp61() {
    let questions = [
        { type: 'input', name: 'schemaId', message: 'Schema id:' }
    ];    
    let answer = await inquirer.prompt(questions);

    const ctx = web3Ctx.getCurrentContext();

    return new Promise((resolve, reject) => {
        ctx.schemas.methods.deleteSchema(answer.schemaId).send(ctx.transactionObject)
        .on('transactionHash', (hash) => {
            web3Ctx.checkTransaction(hash).then( () => resolve(), (err) => reject(err));
        });
    });

}




module.exports = {
        sp1: _sp1,
        sp2: _sp2,
        sp3: _sp3,
        sp4: _sp4,
        sp5: _sp5,
        sp6: _sp6,
        sp61: _sp61
    };
