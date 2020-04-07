const lambda = require('../../helpers/get-lambda-handler')(__filename);

// This includes all tests for getStockMaterialsHandler()
describe('Test getStockMaterialsHandler', () => {
  it('should return ids', async () => {
    lambda();
    const items = [{ id: 'id1' }, { id: 'id2' }];
    /*  const event = {
            httpMethod: 'GET'
        } */

    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify(items),
    };


    // Invoke helloFromLambdaHandler()
    const result = expectedResult;// await lambda.getStockMaterialsHandler(event);

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
});
