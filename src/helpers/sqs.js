const path = require('path');
const debug = require('debug')(`${process.env.DEBUG_NAMESPACE}::handlers::${path.basename(__filename)}`);

const AWS = require('aws-sdk');

const queueUrl = process.env.QUEUEE_URL;
const sqs = new AWS.SQS({ region: 'eu-west-2' });

const sendMessage = (msg) => {
  const sqsParams = {
    MessageBody: JSON.stringify(msg),
    QueueUrl: queueUrl,
  };
  debug(sqsParams);

  sqs.sendMessage(sqsParams, (err, data) => {
    if (err) {
      debug('ERR', err);
    }
    debug(data);
  });
  debug('message sent');
  // context.succeed('Exit');
};

exports.sendMessage = { sendMessage };
