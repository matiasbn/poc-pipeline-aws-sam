const AWS = require('aws-sdk');

const queueUrl = process.env.QUEUEE_URL;
const sqs = new AWS.SQS({ region: 'eu-west-2' });

const sendMessage = (msg) => {
  const sqsParams = {
    MessageBody: JSON.stringify(msg),
    QueueUrl: queueUrl,
  };
  console.info(sqsParams);

  sqs.sendMessage(sqsParams, (err, data) => {
    if (err) {
      console.info('ERR', err);
    }
    console.info(data);
  });
  console.info('message sent');
  // context.succeed('Exit');
};

exports.sendMessage = { sendMessage };
