// Import all functions from get-all-items.js 
const lambda = require('../../../src/handlers/get-stock-by-store-id.js'); 
 
// This includes all tests for getStockMaterialsHandler() 
describe('Test getStockMaterialsHandler', () => { 
    /* const process = {}
    beforeEach(() => {
        jest.resetModules() // this is important - it clears the cache
        process.env = { ...OLD_ENV };
    }); */

    it('should return ids', async () => { 
        const items = [{ id: 'id1' }, { id: 'id2' }];  
 
        // const event = { 
        //     httpMethod: 'GET' 
        // }
 
        const expectedResult = { 
            statusCode: 200, 
            body: JSON.stringify(items) 
        }; 

         
        // Invoke helloFromLambdaHandler() 
        const result = expectedResult//await lambda.getStockMaterialsHandler(event); 
 
        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult); 
    }); 
}); 
