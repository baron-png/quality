const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = process.env.S3_BUCKET_NAME;

/**
 * Ensure the S3 bucket has the following CORS configuration to allow embedding in an iframe:
 * [
 *   {
 *     "AllowedHeaders": ["*"],
 *     "AllowedMethods": ["GET"],
 *     "AllowedOrigins": ["https://www.dualdimension.org"], // Replace with your domain
 *     "ExposeHeaders": ["ETag"],
 *     "MaxAgeSeconds": 3000
 *   }
 * ]
 */

module.exports = { s3, S3_BUCKET };