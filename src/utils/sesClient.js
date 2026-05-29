const { SESClient } = require("@aws-sdk/client-ses");

// Set the AWS Region.
const REGION = "ap-south-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_Key;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_Key;

const clientConfig = { region: REGION };
if (accessKeyId && secretAccessKey) {
  clientConfig.credentials = {
    accessKeyId,
    secretAccessKey,
  };
}

const sesClient = new SESClient(clientConfig);
module.exports = { sesClient };
// snippet-end:[ses.JavaScript.createclientv3]
