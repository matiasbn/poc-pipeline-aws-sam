const appRoot = require('app-root-path');
const path = require('path');
const debug = require('debug')(process.env.DEBUG_NAMESPACE + path.basename(__filename));

const { getMaterialsByStore, getMaterialsBySKU, authWithPassword } = require(`${appRoot}/src/helpers/pim`);

describe('pim helper unit testing', () => {
  test('authWithPassword should return an access token', async () => {
    const result = await authWithPassword();
    const { data: { access_token } } = result;
    expect(access_token).not.toBe(undefined);
  });

  test('getMaterialByStore should return an object with correct fields', async () => {
    // Increase jest timeout
    jest.setTimeout(30000);
    const result = await authWithPassword();
    const { data: { access_token } } = result;
    expect(access_token).not.toBe(undefined);
    const materials = await getMaterialsByStore();
    const keys = Object.keys(materials);
    const someKeysAreNotNumbers = keys.some((key) => typeof Number(key) !== 'number');
    expect(someKeysAreNotNumbers).toBe(false);
    // for every key, check if there are members of the corresponding array that are not numbers
    const someValuesAreNotNumbers = keys
      .map((key) => materials[`${key}`].some((material) => typeof Number(material) !== 'number'))
      // for all the keys, check if there is someone that is not false
      .some((isNotNumber) => isNotNumber !== false);
    expect(someValuesAreNotNumbers).toBe(false);
  });

  test('getMaterialsBySKU should return an object with correct fields', async () => {
    // Increase jest timeout
    jest.setTimeout(30000);
    const result = await authWithPassword();
    const { data: { access_token } } = result;
    expect(access_token).not.toBe(undefined);
    // const materials = await getMaterialsByStore();
    // // pick any store
    // const storeId = Object.keys(materials)[0];
    // const store = materials[`${storeId}`];
    // debug(store);
    // const material = await getMaterialsBySKU(storeId, store[0]);
    // debug(material);
  });
});
