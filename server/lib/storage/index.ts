import { BaseStorage } from "./base";
import LocalStorage from "./local-storage";
import S3Storage from "./s3-storage";

export default class Storage implements BaseStorage {
  private storage!: BaseStorage;

  constructor() {
    const type = process.env.STORAGE_TYPE || "local";

    switch (type) {
      case "local":
        this.storage = new LocalStorage();
        break;
      case "s3":
        this.storage = new S3Storage();
        break;
      default:
        throw new Error("Invalid storage type");
    }
  }

  async put(path: string, data: Buffer | string): Promise<void> {
    return this.storage.put(path, data);
  }

  async get(path: string): Promise<Buffer> {
    return this.storage.get(path);
  }

  async delete(path: string): Promise<void> {
    return this.storage.delete(path);
  }

  async exists(path: string): Promise<boolean> {
    return this.storage.exists(path);
  }
}
