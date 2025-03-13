// utils/s3Upload.js
const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const s3 = new AWS.S3();
const uploadFile = async (file) => {
  const params = {
    Bucket: "akademik-bucket",
    Key: `belgeler/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
  };
  return await s3.upload(params).promise();
};