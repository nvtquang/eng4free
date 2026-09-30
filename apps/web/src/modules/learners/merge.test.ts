import { describe, expect, it } from "vitest";
import { is } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import * as schema from "@/db/schema";
import { learnerOwnedTables } from "./merge";

const tables = Object.values(schema).filter((value) => is(value, PgTable)).map((table) => getTableConfig(table as PgTable));

describe("learner-owned table registry", () => {
  it("lists every table that has a learner_id column, so merging never leaves rows behind", () => {
    const owned = tables.filter((table) => table.name !== "learner_links" && table.columns.some((column) => column.name === "learner_id")).map((table) => table.name).sort();
    expect(Object.keys(learnerOwnedTables).sort()).toEqual(owned);
  });

  it("matches each table's unique index on learner_id", () => {
    for (const [name, { unique }] of Object.entries(learnerOwnedTables)) {
      const table = tables.find((item) => item.name === name)!;
      const uniqueOnLearner = table.indexes.map((index) => index.config).filter((config) => config.unique && config.columns.some((column) => "name" in column && column.name === "learner_id"));
      if (!unique) { expect(uniqueOnLearner, name).toEqual([]); continue; }
      const columns = uniqueOnLearner.map((config) => config.columns.map((column) => ("name" in column ? column.name : "")).filter((column) => column !== "learner_id").sort());
      expect(columns, name).toContainEqual([...unique].sort());
    }
  });
});
