// @ts-expect-error
import FlexSearch from "flexsearch";
import Dexie from "dexie";

export default class FullTextSearch<
  TKeys extends string = string,
  DB extends Dexie = Dexie
> {
  indexes: Record<TKeys, FlexSearch.Index> = {} as never;

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

  search(name: TKeys, query?: string | null) {
    return this.getIndex(name).search(query || "");
  }

  searchAndGet<TValue>(name: TKeys, query?: string | null) {
    const ids = this.search(name, query);
    const table = this.db.table(name as never);
    return table.bulkGet(ids) as Promise<TValue[]>;
  }

  async setupTable(name: TKeys, key: string, columns: string | string[]) {
    const table = this.db.table(name as never);

    const getData = (item: any) => {
      return Array.isArray(columns)
        ? columns.map((col) => item[col]).join(" ")
        : item[columns];
    };

    // Populate current data
    const items = await table.toArray();
    items.forEach((item) => {
      this.add(name, item[key], getData(item));
    });

    // Setup hooks
    table.hook("creating", (_, item) => {
      this.add(name, item[key], getData(item));
    });
    table.hook("updating", (_mods, _key, item) => {
      this.add(name, item[key], getData(item));
    });
  }
}
