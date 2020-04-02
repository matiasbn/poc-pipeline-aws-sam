// Create clients and set shared const values outside of the handler.
const setResponse = (state, message) => {
        return {
            statusCode: state,
            body: typeof(message) === "string" ? message : JSON.stringify(message)
        }
    },
    products = require("../services/materials/pim.services"),
    productsSoap = require("../services/materials/soap.services"),
    { login } = require("../services/soap/client.service"),
    { getMaterial } = require("../services/materials/main"),
    { productKey, connectClient, putProduct } = require("../services/db/redis/redis"),
    defaultStores = process.env.DEFAULT_STORE ? JSON.parse(process.env.DEFAULT_STORE) : {};

let productsResult = [], productObject, keyObject

console.info("Loading")

/**
 * Get Materials Stock from SOAP AND PIM
 */
exports.getStockMaterialsHandler = async (event) => {
    const date = new Date()
    console.log("Init date", date)
    console.log("Into getStockMaterialsHandler")
    try {
        //Redis connection
        await connectClient()
        //PIM
        await products.authWithPassword()
        //SOAP
        const token = await login(process.env.WS_USER, process.env.WS_PASSWORD)
        const skusByStore = await products.getMaterialsByStore();
        //TODO: only for tes with the first store
        const stores = Object.keys(skusByStore)
        
        for (let store of stores) {
            for (let sku of skusByStore[store]) {
                const skuSoap = await products.getMaterialsBySKU(store, sku)
                if(defaultStores[store]) {
                    const defaultStore = { ...defaultStores[store], sku: skuSoap || sku, token }
                    const productDesc = await productsSoap.pimMaterialsStock(defaultStore)
    
                    if(!productDesc || productDesc.Cod_Msj === '401'){
                        console.log("Product SAP", productDesc)
                        return setResponse(400, productDesc);
                    }

                    keyObject = productKey(store, productDesc.NumeroMaterial)
                    productObject = getMaterial(productDesc)
                    putProduct(keyObject, productObject)

                    productsResult.push(productDesc)
                } 
            }
        }

        const diff = new Date() - date
        const time = (diff/1000)/60
        console.log("Process time", time)
        return setResponse(200, {materials: productsResult, time });
    } catch (err) {
        return setResponse(400, err);
    }
}
