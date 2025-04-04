import { BaseStorage } from "./base";
import LocalStorage from "./local-storage";

export default class Storage implements BaseStorage {
  private storage!: BaseStorage;

  constructor() {
    const type = process.env.STORAGE_TYPE || "local";

    switch (type) {
      case "local":
        this.storage = new LocalStorage();
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
