const path = require('path');
const debug = require('debug')(`${process.env.DEBUG_NAMESPACE}::handlers::${path.basename(__filename)}`);

const soap = require('./client');

const materialsStock = (token, sku, center, venue, org) => {
  try {
    return soap.materialsStock(token, sku, center, venue, org);
  } catch (e) {
    debug('error', e);
  }
};

const pimMaterialsStock = ({
  token, sku, center, venue, org,
}) => materialsStock(token, sku, center, venue, org);

module.exports = { pimMaterialsStock, materialsStock };
