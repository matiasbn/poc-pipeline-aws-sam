const axios = require('axios');
const moment = require('moment');
const path = require('path');
const debug = require('debug')(`Masisa::helpers::${path.basename(__filename)}`);

const pimUrl = process.env.PIM_URL || '';
const pimUsername = process.env.PIM_USERNAME || '';
const pimPassword = process.env.PIM_PASSWORD || '';
const pimClientId = process.env.PIM_CLIENT_ID || '';
const pimSecret = process.env.PIM_SECRET || '';
const pim = { token: '', expirationToken: '' };

const getBase64ClientIdSecret = () => {
  const buff = Buffer.from(`${pimClientId}:${pimSecret}`);
  return buff.toString('base64');
};

const authWithPassword = async () => {
  try {
    const result = await axios.post(`${pimUrl}/api/oauth/v1/token`,
      { username: pimUsername, password: pimPassword, grant_type: 'password' },
      { headers: { Authorization: `Basic ${getBase64ClientIdSecret()}` } });

    if (result.data && result.data.access_token) {
      pim.token = result.data.access_token;
      // TODO: Change this for Interceptor
      pim.expirationToken = moment().add(
        result.data.expires_in - 1800,
        'seconds',
      );
    } else {
      pim.token = '';
    }
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * This is the conversion of SKU from api/rest/v1/products and api/rest/v1/products/${sku}
 * Most of the cases is the same SKU, maybe not.
 * @since      09.05.2020
 * @deprecated N/A
 * @param {string} store - Store Code.
 * @param {string} sku - SKU product Pim.
 * @returns {string} sku
 */
const getMaterialsBySKU = async (store, sku) => {
  try {
    const result = await axios
      .get(`${pimUrl}/api/rest/v1/products/${sku}`,
        { headers: { Authorization: `Bearer ${pim.token}` } });
    if (result.data && result.data.values) {
      const filterStore = `sku_${store}`;
      const valStore = Object.keys(result.data.values).find((x) => x.includes(filterStore));
      if (valStore && result.data.values[valStore].length > 0) {
        return result.data.values[valStore][0].data;
      }
    }

    return '';
  } catch (error) {
    return error;
  }
};

/**
 * Find the list of SKUs group by Store code.
 * @since      09.05.2020
 * @deprecated N/A
 * @param {string} token - Use the pim token.
 * @returns {object} store and sku list.
 */
const getMaterialsByStore = async () => {
  try {
    const result = await axios
      .get(`${pimUrl}/api/rest/v1/products`, {
        headers: {
          Authorization: `Bearer ${pim.token}`,
        },
      });
    if (result.data && result.data._embedded && result.data._embedded.items) {
      const allItems = result.data._embedded.items;
      const storeSku = {};
      for (let i = 0; i < allItems.length; i++) {
        if (allItems[i].values) {
          const regexStore = /sku_[0-9]+/gm;
          const listStores = Object.keys(allItems[i].values).filter((item) => item.match(regexStore));

          if (listStores.length > 0) {
            listStores.forEach((store) => {
              const cleanStore = store.split('sku_')[1];
              if (storeSku[cleanStore] === undefined) {
                storeSku[cleanStore] = [];
              }
              if (allItems[i].values[store][0].data) storeSku[cleanStore].push(allItems[i].values[store][0].data);
            });
          }
        }
      }
      return storeSku;
    }
    return 'no embedded items';
  } catch (error) {
    return error;
  }
};

module.exports = {
  getMaterialsByStore,
  getMaterialsBySKU,
  authWithPassword,
};
