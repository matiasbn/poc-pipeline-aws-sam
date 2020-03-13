const axios = require("axios"),
  moment = require("moment"),
  pimUrl = process.env.PIM_URL || "",
  pimUsername = process.env.PIM_USERNAME || "",
  pimPassword = process.env.PIM_PASSWORD || '',
  pimClientId = process.env.PIM_CLIENT_ID || "",
  pimSecret = process.env.PIM_SECRET || "",
  pim = { token: "", expirationToken: "" };

const getBase64ClientIdSecret = () => {
  let buff = Buffer.from(pimClientId + ":" + pimSecret);
  return buff.toString("base64");
};

const authWithPassword = async () => {
  const result = await axios
    .post(
      `${pimUrl}/api/oauth/v1/token`,
      {
        username: pimUsername,
        password: pimPassword,
        grant_type: "password"
      },
      {
        headers: {
          Authorization: `Basic ${getBase64ClientIdSecret()}`
        }
      }
    )
    .catch(e => {
      /* Slack.sendMessage({
            message: `Problemas con Auth de PIM ${e}`,
            channel_id: Slack.my_channel
        }); */
      return e;
    });

  if (result.data !== undefined && result.data.access_token !== undefined) {
    pim.token = result.data.access_token;
    //TODO: Change this for Interceptor
    pim.expirationToken = moment().add(
      result.data.expires_in - 1800,
      "seconds"
    );
  } else {
    pim.token = "";
  }

  return result;
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
  const result = await axios
    .get(`${pimUrl}/api/rest/v1/products/${sku}`, {
      headers: {
        Authorization: `Bearer ${pim.token}`
      }
    })
    .catch(e => {
      return e;
    });

  if (result.data !== undefined && result.data.values !== undefined) {
    const filterStore = `sku_${store}`;
    const valStore = Object.keys(result.data.values).find(x =>
      x.includes(filterStore)
    );
    if (valStore !== undefined && result.data.values[valStore].length > 0) {
      return result.data.values[valStore][0].data;
    }
  }

  return "";
};

/**
 * Find the list of SKUs group by Store code.
 * @since      09.05.2020
 * @deprecated N/A
 * @param {string} token - Use the pim token.
 * @returns {object} store and sku list.
 */
const getMaterialsByStore = async () => {
  const result = await axios
    .get(`${pimUrl}/api/rest/v1/products`, {
      headers: {
        Authorization: `Bearer ${pim.token}`
      }
    })
    .catch(e => {
      return e;
    });

  if (
    result.data !== undefined &&
    result.data._embedded !== undefined &&
    result.data._embedded.items !== undefined
  ) {
    const allItems = result.data._embedded.items;
    let storeSku = {};

    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i].values !== undefined) {
        const regexStore = /sku_[0-9]+/gm;
        const listStores = Object.keys(allItems[i].values).filter(item =>
          item.match(regexStore)
        );

        if (listStores.length > 0) {
          listStores.forEach(ele => {
            const cleanStore = ele.split("sku_")[1];
            if (storeSku[cleanStore] === undefined) {
              storeSku[cleanStore] = [];
            }
            if (allItems[i].values[ele][0].data !== undefined)
              storeSku[cleanStore].push(allItems[i].values[ele][0].data);
          });
        }
      }
    }
    return storeSku;
  } else {
    return;
  }
};

module.exports = {
  getMaterialsByStore,
  getMaterialsBySKU,
  authWithPassword
};
