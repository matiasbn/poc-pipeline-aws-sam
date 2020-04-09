const path = require('path');
const debug = require('debug')(`${process.env.DEBUG_NAMESPACE}::helpers::${path.basename(__filename)}`);

const { soap } = require('strong-soap');

const timeout = 5 * 60 * 1000; // 5 minutes
let client = {};
let count = 0;
const wsURL = process.env.WS_URL;
const user = process.env.WS_USER;
const pass = process.env.WS_PASSWORD;
/**
 * Summary. This is for create the Soap Client for SAP services. (Actual)
 *
 * Description. N/A
 *
 * @since      03.05.2020
 * @deprecated N/A
 * @access     private
 *
 * @param {none}   var  N/A.
 *
 * @return {any} Soap Client.
 */

const setClient = (soapClient) => {
  client = soapClient;
};

const createSoapClient = async () => new Promise((resolve, reject) => {
  soap.createClient(
    `${wsURL}/MaterialesMasisa.asmx?WSDL`,
    {
      debug: false,
    },
    (error, client) => {
      if (error) {
        setClient('');
        reject(error);
      } else {
        setClient(client);
        resolve(client);
      }
    },
  );
});

/**
 * Summary. This is for login into the Soap Client for SAP services. (Actual)
 *
 * Description. The token will be created any times to call a Soap SAP services.
 * Description. N/A
 *
 * @since      03.05.2020
 * @deprecated N/A
 * @access     private
 *
 * @param {string}   user. User for SOAP Client, set in enviroment.
 * @param {string}   pass. Pass for SOAP Client, set in enviroment.
 *
 * @return {any} Soap token.
 */
const login = async () => {
  await createSoapClient();
  return new Promise((resolve, reject) => {
    client.Login(
      {
        p_Usuario: user,
        p_Contraseña: pass,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          debug(result.LoginResult.Token);
          resolve(result.LoginResult.Token);
        }
      },
      { timeout },
    );
  });
};

const materialsStock = (token, sku, center, venue, org) => new Promise((resolve, reject) => {
  client.StockMateriales(
    {
      p_Token: token, p_Material: sku, p_Centro: center, p_Almacen: venue, p_OrgVenta: org,
    },
    async (error, { StockMaterialesResult: result }) => {
      if (error) reject(error);
      else if (result.Cod_Msj && result.Cod_Msj === '401' && count === 0) {
        count++;
        token = await login();
        materialsStock(token, sku, center, venue, org);
      } else {
        resolve(result);
      }
    },
    { timeout },
  );
});

module.exports = { login, createSoapClient, materialsStock };
