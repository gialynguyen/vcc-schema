// @ts-ignore TS6133
import { expect, test } from "@jest/globals";
import { string, number, oneOf } from "../";
import { ErrorSet, InvalidUnionTypeError, TooBigError } from "../../error";

describe("union type 1", () => {
  const union = oneOf([string(), number()]);

  test("valid type", () => {
    const pass = union.parser("Gialynguyen");

    expect(pass).toEqual("Gialynguyen");
  });

  test("invalid type", () => {
    expect(() => {
      union.parser(true);
    }).toThrowError(
      new ErrorSet([
        new InvalidUnionTypeError({
          expectedType: ["string", "number"],
          receivedType: "boolean",
        }),
      ]).message
    );
  });
});

describe("union type 2", () => {
  const union = oneOf([string(), number().max(4)]);

  test("valid type", () => {
    const pass = union.parser(2);

    expect(pass).toEqual(2);
  });

  test("invalid type", () => {
    expect(() => {
      union.parser(14);
    }).toThrowError(
      new ErrorSet([
        new TooBigError({
          expectedSize: 4,
          receivedSize: 14,
        }),
      ]).message
    );
  });
});

describe("union type 2", () => {
  const union = oneOf(
    [string(), number().max(4)],
    "Vui lòng nhập một chuỗi hoặc một số bé hơn hoặc bằng 4"
  );

  test("valid type", () => {
    const pass = union.parser(2);

    expect(pass).toEqual(2);
  });

  test("invalid type", () => {
    expect(() => {
      union.parser(14);
    }).toThrowError(
      new ErrorSet([
        new InvalidUnionTypeError({
          expectedType: ["string", "number"],
          receivedType: "boolean",
          message: "Vui lòng nhập một chuỗi hoặc một số bé hơn hoặc bằng 4",
        }),
      ]).message
    );
  });
});
