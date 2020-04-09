const soap = require('../soap/client.service');

const materialsStock = (token, sku, center, venue, org) => {
  try {
    return soap.materialsStock(token, sku, center, venue, org);
  } catch (e) {
    console.log('error', e);
  }
};

const pimMaterialsStock = ({
  token, sku, center, venue, org,
}) => materialsStock(token, sku, center, venue, org);

module.exports = { pimMaterialsStock, materialsStock };
