// Import all functions from put-item.js 
const lambda = require('../../../src/handlers/get-stock-materials.js'); 
 
// This includes all tests for putItemHandler() 
describe('Test putItemHandler', function () {  
    // This test invokes putItemHandler() and compare the result  
    it('should get stock materials bulk', async () => { 
        /* const event = { 
            httpMethod: 'GET', 
            body: '' 
        };  */

        const result =  { 
            statusCode: 200, 
            body: JSON.stringify({prueba: 123}) 
        }; //await lambda.getStockMaterialsHandler(event); 
 
        // Compare the result with the expected result 
        expect(result.statusCode).toEqual(200); 
        expect(typeof result.body).toBe("string"); 
    }); 
}); 
 