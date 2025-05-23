const {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Upload } = require('@aws-sdk/lib-storage');
const process = require('process');

class StorageService {
  constructor() {
    this._client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this._bucketName = process.env.AWS_BUCKET_NAME;
  }

  async uploadCover(file, meta) {
    const filename = `cover-${meta.albumId}-${Date.now()}.${meta.ext}`;

    // Upload
    const upload = new Upload({
      client: this._client,
      params: {
        Bucket: this._bucketName,
        Key: filename,
        Body: file,
        ContentType: meta.headers['content-type'],
      },
    });

    // Execute the upload
    await upload.done();

    // Generate presigned URL for accessing file
    const getCommand = new GetObjectCommand({
      Bucket: this._bucketName,
      Key: filename,
    });

    return await getSignedUrl(this._client, getCommand, {
      expiresIn: process.env.S3_URL_EXPIRATION || 604800,
    });
  }

  async deleteCover(url) {
    const filename = new URL(url).pathname.split('/').pop();
    const command = new DeleteObjectCommand({
      Bucket: this._bucketName,
      Key: filename,
    });

    await this._client.send(command);
  }
}

module.exports = StorageService;
