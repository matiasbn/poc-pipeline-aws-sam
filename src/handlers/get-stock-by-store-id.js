const path = require('path');
const debug = require('debug')(`${process.env.DEBUG_NAMESPACE}::handlers::${path.basename(__filename)}`);

const setResponse = (state, message) => ({
  statusCode: state,
  body: typeof (message) === 'string' ? message : JSON.stringify(message),
});
const products = require('../helpers/pim');
const productsSoap = require('../helpers/soap');
const { login } = require('../helpers/client');

const defaultStores = process.env.DEFAULT_STORE ? JSON.parse(process.env.DEFAULT_STORE) : {};

const productsResult = [];

debug('Loading');

/**
 * Get Materials Stock from SOAP AND PIM one Store.
 */
exports.getStockByStoreIdHandler = async (event) => {
  const date = new Date();
  debug('Init date', date);
  debug('Into getStockByStoreIdHandler');
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  debug('received:', event);

  // Get store from pathParameters from APIGateway because of `/{store}` at template.yml
  const { store } = event.pathParameters;
  try {
    if (defaultStores[store]) {
      // PIM
      await products.authWithPassword().catch((e) => setResponse(400, e));
      // SOAP
      const token = await login(process.env.WS_USER, process.env.WS_PASSWORD).catch((e) => setResponse(400, e));
      const skusByStore = await products.getMaterialsByStore();

      for (const sku of skusByStore[store]) {
        const skuSoap = await products.getMaterialsBySKU(store, sku);

        const defaultStore = { ...defaultStores[store], sku: skuSoap || sku, token };
        const productDesc = await productsSoap.pimMaterialsStock(defaultStore);

        if (!productDesc || productDesc.Cod_Msj === '401') {
          debug('Product SAP', productDesc);
          return setResponse(400, productDesc);
        }

        productsResult.push(productDesc);
      }
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(productsResult),
    };

    return response;
  } catch (e) {
    return setResponse(400, e);
  }
  /*
    // All log statements are written to CloudWatch
    debug(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response; */
};
