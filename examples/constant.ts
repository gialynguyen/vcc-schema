import { constant, ValueType } from "../dist";

const ConstantSchemaType = constant("ConstantType");

type ConstantType = ValueType<typeof ConstantSchemaType>;

try {
  ConstantSchemaType.parser("SomeValue");
} catch (error) {
  console.log(JSON.stringify(error.format(), null, 2));
}
