// Create clients and set shared const values outside of the handler.
const setResponse = (state, message) => ({
  statusCode: state,
  body: typeof (message) === 'string' ? message : JSON.stringify(message),
});
const products = require('../helpers/pim');
const productsSoap = require('../helpers/soap');
const { getMaterial } = require('../helpers/main');
const { login } = require('../helpers/client');
const { productKey, connectClient, putProduct } = require('../helpers/redis');

const defaultStores = process.env.DEFAULT_STORE ? JSON.parse(process.env.DEFAULT_STORE) : {};

const productsResult = []; let productObject; let
  keyObject;

console.info('Loading');

/**
 * Get Materials Stock from SOAP AND PIM
 */
exports.getStockMaterialsHandler = async (event) => {
  const date = new Date();
  console.log('Init date', date);
  console.log('Into getStockMaterialsHandler');
  try {
    // Redis connection
    await connectClient();
    // PIM
    await products.authWithPassword();
    // SOAP
    const token = await login(process.env.WS_USER, process.env.WS_PASSWORD);
    const skusByStore = await products.getMaterialsByStore();
    // TODO: only for tes with the first store
    const stores = Object.keys(skusByStore);

    for (const store of stores) {
      for (const sku of skusByStore[store]) {
        const skuSoap = await products.getMaterialsBySKU(store, sku);
        if (defaultStores[store]) {
          const defaultStore = { ...defaultStores[store], sku: skuSoap || sku, token };
          const productDesc = await productsSoap.pimMaterialsStock(defaultStore);

          if (!productDesc || productDesc.Cod_Msj === '401') {
            console.log('Product SAP', productDesc);
            return setResponse(400, productDesc);
          }

          keyObject = productKey(store, productDesc.NumeroMaterial);
          productObject = getMaterial(productDesc);
          putProduct(keyObject, productObject);

          productsResult.push(productDesc);
        }
      }
    }

    const diff = new Date() - date;
    const time = (diff / 1000) / 60;
    console.log('Process time', time);
    return setResponse(200, { materials: productsResult, time });
  } catch (err) {
    return setResponse(400, err);
  }
};
