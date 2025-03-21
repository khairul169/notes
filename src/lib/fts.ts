// @ts-expect-error no types
import FlexSearch from "flexsearch";
import Dexie, { Table } from "dexie";

export default class FullTextSearch<
  TKeys extends string = string,
  DB extends Dexie = Dexie,
> {
  indexes: Record<TKeys, FlexSearch.Index> = {} as never;
  tables: Record<
    TKeys,
    {
      key: string;
      columns: string | string[];
      isPrepared: boolean;
      table: Table;
    }
  > = {} as never;

  constructor(private db: DB) {}

  getIndex(name: TKeys) {
    if (!this.indexes[name]) {
      this.indexes[name] = new FlexSearch.Index({
        tokenize: "forward",
        resolution: 9,
      });
    }
    return this.indexes[name];
  }

  add(name: TKeys, id: string, content: unknown) {
    const data = Array.isArray(content)
      ? content.map(String).join(" ")
      : String(content);
    this.getIndex(name).add(id, data);
  }

  async search(name: TKeys, query?: string | null) {
    // Preload data & setup hooks
    if (this.tables[name] && !this.tables[name].isPrepared) {
      await this.prepare(name);
    }

    return this.getIndex(name).search(query || "");
  }

  async searchAndGet<TValue>(name: TKeys, query?: string | null) {
    const ids = await this.search(name, query);
    const table = this.db.table(name as never);
    return table.bulkGet(ids) as Promise<TValue[]>;
  }

  async addTable(name: TKeys, key: string, columns: string | string[]) {
    if (this.tables[name] != null) {
      return;
    }

    const table = this.db.table(name as never);
    this.tables[name] = {
      key,
      columns,
      isPrepared: false,
      table,
    };
  }

  async prepare(name: TKeys) {
    const { key, columns } = this.tables[name];
    const table = this.db.table(name as never);

    const getData = (item: Record<string, unknown>) => {
      return Array.isArray(columns)
        ? columns.map((col) => item[col]).join(" ")
        : item[columns];
    };

    // Populate current data
    const items = await table.toArray();
    await Promise.all(
      items.map(async (item) => this.add(name, item[key], getData(item)))
    );

    // Setup hooks
    table.hook("creating", (_, item) => {
      this.add(name, item[key], getData(item));
    });
    table.hook("updating", (_mods, _key, item) => {
      this.add(name, item[key], getData(item));
    });

    this.tables[name].isPrepared = true;
  }
}
