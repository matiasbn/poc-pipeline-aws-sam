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
    defaultStores = JSON.parse(process.env.DEFAULT_STORE);

let productsResult = []

console.log("Loading")

/**
 * Get Materials Stock from SOAP AND PIM
 */
exports.getStockMaterialsHandler = async (event) => {
    const date = new Date()
    console.log("Init date", date)
    console.log("Into getStockMaterialsHandler")
    try {
        //PIM
        await products.authWithPassword().catch((e) => {
            return setResponse(400, e);
        });
        //SOAP
        const token = await login(process.env.WS_USER, process.env.WS_PASSWORD).catch((e) => {
            return setResponse(400, e);
        })
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
