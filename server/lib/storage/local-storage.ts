import { BaseStorage } from "./base";
import { join } from "path";
import fs from "fs/promises";

export default class LocalStorage implements BaseStorage {
  private dir: string = "";

  constructor() {
    this.dir = join(process.cwd(), "storage");
  }

  async put(path: string, data: Buffer | string): Promise<void> {
    if (!(await fs.exists(this.dir))) {
      await fs.mkdir(this.dir, { recursive: true });
    }

    return fs.writeFile(join(this.dir, path), data);
  }

  async get(path: string): Promise<Buffer> {
    return fs.readFile(join(this.dir, path));
  }

  async delete(path: string): Promise<void> {
    return fs.unlink(join(this.dir, path));
  }

  async exists(path: string): Promise<boolean> {
    return fs.exists(join(this.dir, path));
  }
}
