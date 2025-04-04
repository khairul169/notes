//

export interface BaseStorage {
  put(path: string, data: Buffer | string): Promise<void>;
  get(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
