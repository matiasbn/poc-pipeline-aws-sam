const path = require('path');
const debug = require('debug')(`${process.env.DEBUG_NAMESPACE}::handlers::${path.basename(__filename)}`);
const { sendMessage } = require('../helpers/sqs');

// Create clients and set shared const values outside of the handler.
let response;
let productsResult = [];

const products = require('../helpers/pim');

const defaultStores = process.env.DEFAULT_STORE ? JSON.parse(process.env.DEFAULT_STORE) : {};
/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */


exports.getStockMaterialsQueueHandler = async (event, context) => {
  try {
    await products.authWithPassword();
    const skusByStore = await products.getMaterialsByStore();
    // TODO: only for tes with the first store
    const [stores] = Object.keys(skusByStore).filter((current) => defaultStores[current] != null);

    // TODO: Splice to test firt 5
    for (const sku of skusByStore[stores].slice(0, 5)) {
      const skuSoap = await products.getMaterialsBySKU(stores, sku);
      const defaultStore = { ...defaultStores[stores], sku: skuSoap || sku };
      productsResult.push(defaultStore);

      if (productsResult.length === +process.env.INTERV_TO_QUEUE) {
        console.info('Material stock to enqueue', JSON.stringify(productsResult));
        sendMessage(productsResult);
        productsResult = [];
      }
    }

    if (productsResult.length > 0) {
      console.info('send last block to queue', JSON.stringify(productsResult));
      sendMessage(productsResult);
      productsResult = [];
    }

    response = {
      statusCode: 200,
      body: JSON.stringify({ message: productsResult }),
    };
    return response;
  } catch (err) {
    response = {
      statusCode: 400,
      body: JSON.stringify({ message: productsResult }),
    };
    return response;
  }
};
