// src/services/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
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

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      Body: imageData,
      ContentEncoding: 'base64',
      ContentType: mimeType
    });

    await this.s3.send(command);

    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  }
}
