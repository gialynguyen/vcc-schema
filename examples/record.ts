import { array, string, number, record, tuples, ValueType } from "../dist";

const recordSchema = record(record(tuples([number(), array(string())])));

type T = ValueType<typeof recordSchema>;

recordSchema.parser({
  demo: {
    nested: [3, ["Tom"]],
  },
});
