import { BaseStorage } from "./base";
import { S3Client } from "bun";

export default class S3Storage implements BaseStorage {
  private prefix: string = "";
  private client!: S3Client;

  constructor() {
    this.prefix = process.env.S3_KEY_PREFIX || "";
    this.client = new S3Client({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      bucket: process.env.S3_BUCKET,
      virtualHostedStyle: process.env.S3_VIRTUAL_HOSTED_STYLE === "true",
    });
  }

  async put(path: string, data: Buffer | string): Promise<void> {
    await this.client.write(this.key(path), data);
  }

  async get(path: string): Promise<Buffer> {
    const file = this.client.file(this.key(path));
    const arr = await file.arrayBuffer();
    return Buffer.from(arr);
  }

  async delete(path: string): Promise<void> {
    await this.client.delete(this.key(path));
  }

  async exists(path: string): Promise<boolean> {
    return this.client.exists(this.key(path));
  }

  private key(path: string) {
    return this.prefix + path;
  }
}
