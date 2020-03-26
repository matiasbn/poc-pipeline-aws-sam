const setResponse = (state, message) => {
  return {
    statusCode: state,
    body: typeof (message) === "string" ? message : JSON.stringify(message)
  }
},
  products = require("../services/materials/pim.services"),
  productsSoap = require("../services/materials/soap.services"),
  { login } = require("../services/soap/client.service"),
  defaultStores = JSON.parse(process.env.DEFAULT_STORE);

let productsResult = []

console.log("Loading")

/**
 * Get Materials Stock from SOAP AND PIM one Store.
 */
exports.getStockByStoreIdHandler = async (event) => {
  const date = new Date()
  console.info("Init date", date)
  console.info("Into getStockByStoreIdHandler")
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  // Get store from pathParameters from APIGateway because of `/{store}` at template.yml
  const store = event.pathParameters.store;
  try {

    if (defaultStores[store]) {
      //PIM
      await products.authWithPassword().catch((e) => {
        return setResponse(400, e);
      });
      //SOAP
      const token = await login(process.env.WS_USER, process.env.WS_PASSWORD).catch((e) => {
        return setResponse(400, e);
      })
      const skusByStore = await products.getMaterialsByStore();

      for (let sku of skusByStore[store]) {
        const skuSoap = await products.getMaterialsBySKU(store, sku)

        const defaultStore = { ...defaultStores[store], sku: skuSoap || sku, token }
        const productDesc = await productsSoap.pimMaterialsStock(defaultStore)

        if (!productDesc || productDesc.Cod_Msj === '401') {
          console.log("Product SAP", productDesc)
          return setResponse(400, productDesc);
        }

        productsResult.push(productDesc)
      }
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(productsResult)
    };

    return response
  } catch (e) {
    return setResponse(400, e);
  }
  /* 
    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response; */
}
