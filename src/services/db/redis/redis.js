const redis = require('redis');
const port = process.env.REDIS_PORT
const host = process.env.REDIS_URL

const client = redis.createClient(port, host)

const productKey = (store, product) => `PS:${store}:${product}`;
const connectClient = () => {
    return new Promise((resolve, reject) => {
        client.on('connect', function() {
            console.info('redis connected');
            resolve()
        });

        client.on("error", function(err) {
            console.info('redis connected error!');
            reject(err)
        })
    })
}

const putProduct =  (key, product) => {
    RedisCache.set(key, product, 60 * 60 * 12).then(() => product)
}

module.exports = { productKey, connectClient, putProduct }
