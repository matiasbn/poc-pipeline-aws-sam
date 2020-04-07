// Obtains lambda handler matching the name of the test and the name of the handler
const path = require('path');

module.exports = function (filename) {
  const lambdaName = path.basename(filename).split('.')[0];
  const lambdaObject = require(`${process.env.ROOT_PATH}/src/handlers/${lambdaName}.js`);
  const handlerName = Object.keys(lambdaObject)[0];
  return lambdaObject[`${handlerName}`];
};
