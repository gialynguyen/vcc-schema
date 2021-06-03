// @ts-ignore TS6133
import { expect, test } from "@jest/globals";
import { string, array } from "../";

import { ErrorSet, InvalidTypeError, TooSmallError } from "../../error";

describe("mixed type", () => {
  const addresses = array(string().min(5));

  test("valid type", () => {
    const pass = addresses.parser(["Gialynguyen"]);

    expect(pass).toEqual(["Gialynguyen"]);
  });

  test("invalid type", () => {
    expect(() => {
      addresses.parser(5);
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "array",
          receivedType: "number",
        }),
      ]).message
    );
  });

  test("invalid element type", () => {
    expect(() => {
      addresses.parser([5]);
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "string",
          receivedType: "number",
          paths: [0],
        }),
      ]).message
    );
  });

  test("invalid element format", () => {
    expect(() => {
      addresses.parser(["abc"]);
    }).toThrowError(
      new ErrorSet([
        new TooSmallError({
          expectedSize: 5,
          receivedSize: 3,
          paths: [0],
        }),
      ]).message
    );
  });
});
