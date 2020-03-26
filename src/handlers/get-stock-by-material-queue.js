const productsSoap = require("../services/materials/soap.services"),
      { login } = require("../services/soap/client.service"),
      productsResult = [],
      setResponse = (state, message) => {
        return {
            statusCode: state,
            body: typeof(message) === "string" ? message : JSON.stringify(message)
        }
    };
let response = {};

exports.getStockByMaterialQueueHandler = async (event) => {
    try {
        if(!(event.products && event.products.length > 0)) {
            response = {
                statusCode: 400,
                body: JSON.stringify({
                  message: "Material Stock not found." 
                })
              };
            console.info(response);
        }

      //SOAP
      const token = await login().catch((e) => {
          return setResponse(400, e);
      })
      for (let material of event.products) {
              const productDesc = await productsSoap.pimMaterialsStock({...material, token})

              if(!productDesc || productDesc.Cod_Msj === '401'){
                  console.log("Product SAP", productDesc)
                  return setResponse(400, productDesc);
              }
              productsResult.push(productDesc)
      }
      response = {
          statusCode: 200,
          body: JSON.stringify({
            message: productsResult
          })
        };
        console.info(response);
        return response;

    } catch(e) {
        response = {
            statusCode: 500,
            body: JSON.stringify({
              message: {error: "Exception was happend.", message: e}  
            })
          };
          console.info(response);
          return response;
    } 
}
