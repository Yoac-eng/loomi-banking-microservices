import 'dotenv/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

import type { IStorageProvider } from '../../domain/interfaces/providers/storage.provider.interface';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly bucketUrl: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || '';
    this.bucketUrl = process.env.S3_BUCKET_URL || '';

    if (!this.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: file,
      ContentType: mimetype,
    });

    await this.s3Client.send(command);

    const url = `${this.bucketUrl}/${filename}`;
    return url;
  }
}
