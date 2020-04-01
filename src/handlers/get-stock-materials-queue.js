// Create clients and set shared const values outside of the handler.
let response, productsResult = [], count = 0;
const AWS = require('aws-sdk');
const queueUrl = process.env.QUEUEE_URL,
 sqs = new AWS.SQS({region:'eu-west-2'}),
 products = require("../services/materials/pim.services"),
 defaultStores = process.env.DEFAULT_STORE ? JSON.parse(process.env.DEFAULT_STORE) : {};
/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */

const sendMessage = (msg) => {
    var sqsParams = {
      MessageBody: JSON.stringify(msg),
      QueueUrl: queueUrl
    };
    console.info(sqsParams)

    sqs.sendMessage(sqsParams, function(err, data) {
      if (err) {
        console.info('ERR', err);
      }
      console.info(data);
    });
    console.info('message sent')
    //context.succeed('Exit');
}

exports.getStockMaterialsQueueHandler = async (event, context) => {
  try {
    await products.authWithPassword();
    const skusByStore = await products.getMaterialsByStore();
    //TODO: only for tes with the first store
    const [stores] = Object.keys(skusByStore).filter(current => defaultStores[current] != null)
    //TODO: Splice to test firt 5
    for (let sku of skusByStore[stores].slice(0, 5)) {
      const skuSoap = await products.getMaterialsBySKU(stores, sku)
      const defaultStore = {...defaultStores[stores], sku: skuSoap || sku}
      productsResult.push(defaultStore)

      if(productsResult.length === +process.env.INTERV_TO_QUEUE){
        console.info("Material stock to enqueue", JSON.stringify(productsResult))
        sendMessage(productsResult)
        productsResult = []
      }
    }

    if(productsResult.length > 0){
      console.info("send last block to queue", JSON.stringify(productsResult))
      sendMessage(productsResult)
      productsResult = []
    }

    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: productsResult 
      })
    };
    return response;

  } catch (err) {
    response = {
      statusCode: 400,
      body: JSON.stringify({
        message: productsResult 
      })
    };
    return response;
  }
}
