import { tuples, number, string, array, ValueType } from "../dist";

const tuplesSchema = tuples([
  number("Vui lòng nhập một số"),
  string(),
  array(string()),
  tuples([string()]),
]);

const result = tuplesSchema.parser([1, "gialynguyen"]);
type T = ValueType<typeof tuplesSchema>;
