const path = require('path');
const debug = require('debug')(`${process.env.DEBUG_NAMESPACE}::handlers::${path.basename(__filename)}`);
const productsSoap = require('../helpers/soap');
const { login } = require('../helpers/client');


const productsResult = [];
const setResponse = (state, message) => ({
  statusCode: state,
  body: typeof (message) === 'string' ? message : JSON.stringify(message),
});

let response = {};

exports.getStockByMaterialQueueHandler = async (event) => {
  try {
    if (!(event.products && event.products.length > 0)) {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Material Stock not found.',
        }),
      };
      debug(response);
    }

    // SOAP
    const token = await login().catch((e) => setResponse(400, e));
    // const materialPromises = event.products
    //   .map((material) => productsSoap.pimMaterialsStock({ ...material, token }));

    for (const material of event.products) {
      const productDesc = await productsSoap.pimMaterialsStock({ ...material, token });

      if (!productDesc || productDesc.Cod_Msj === '401') {
        debug('Product SAP', productDesc);
        return setResponse(400, productDesc);
      }

      // TODO: Check where is the store?
      keyObject = productKey(store, productDesc.NumeroMaterial);
      productObject = getMaterial(productDesc);
      putProduct(keyObject, productObject);
      productsResult.push(productDesc);
    }
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: productsResult,
      }),
    };
    debug(response);
    return response;
  } catch (e) {
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: { error: 'Exception was happend.', message: e },
      }),
    };
    debug(response);
    return response;
  }
};
