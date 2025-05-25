// src/services/s3.service.ts
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3: AWS.S3;
  private readonly bucket: string;

  constructor() {
    this.s3 = new AWS.S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      region: process.env.AWS_REGION!,
    });
    this.bucket = process.env.AWS_S3_BUCKET_NAME!;
  }

  async uploadBase64Image(base64: string): Promise<string> {
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid base64 string');

    const mimeType = matches[1];
    const imageData = Buffer.from(matches[2], 'base64');
    const extension = mimeType.split('/')[1];
    const fileName = `users/${uuid()}.${extension}`;

    await this.s3
      .putObject({
        Bucket: this.bucket,
        Key: fileName,
        Body: imageData,
        ContentEncoding: 'base64',
        ContentType: mimeType
      })
      .promise();

    return `https://${this.bucket}.s3.${this.s3.config.region}.amazonaws.com/${fileName}`;
  }
}
