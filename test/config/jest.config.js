const fs = require('fs');
const path = require('path');

process.env.DEBUG_NAMESPACE = 'Masisa::test::';
process.env.ROOT_PATH = require('app-root-path');

const env = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../env.json')));
process.env = {
  ...process.env,
  ...env.massiveByStoreFunction.CONFIG.SOAP,
  ...env.massiveByStoreFunction.CONFIG.PIM,
  ...env.putItemFunction,
};
