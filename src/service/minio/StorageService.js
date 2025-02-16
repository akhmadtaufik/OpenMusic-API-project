const { Client } = require('minio');
const process = require('process');

class StorageService {
  constructor() {
    this._client = new Client({
      endPoint: new URL(process.env.MINIO_ENDPOINT).hostname,
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
    this._bucketName = process.env.MINIO_BUCKET_NAME;
    this._ensureBucketExists();
  }

  async _ensureBucketExists() {
    const bucketExists = await this._client.bucketExists(this._bucketName);

    if (!bucketExists) {
      await this._client.makeBucket(this._bucketName, 'us-west-1');
    }
  }

  async uploadCover(file, meta) {
    const filename = `cover-${meta.albumId}-${Date.now()}.${meta.ext}`;
    await this._client.putObject(this._bucketName, filename, file, {
      'Content-Type': meta.headers['content-type'],
    });
    return `${process.env.MINIO_PUBLIC_ENDPOINT}/${this._bucketName}/${filename}`;
  }

  async deleteCover(url) {
    const filename = url.split('/').pop();
    await this._client.removeObject(this._bucketName, filename);
  }
}

module.exports = StorageService;
