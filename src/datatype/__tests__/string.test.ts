// @ts-ignore TS6133
import { expect, test } from "@jest/globals";
import { string } from "../";

import {
  ErrorSet,
  InvalidTypeError,
  TooBigError,
  TooSmallError,
} from "../../error";

describe("string type", () => {
  const name = string();

  test("valid type", () => {
    const pass = name.parser("Gialynguyen");
    expect(pass).toEqual("Gialynguyen");
  });

  test("invalid type", () => {
    expect(() => {
      name.parser(5);
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "string",
          receivedType: "number",
        }),
      ]).message
    );
  });

  test("custom error string", () => {
    expect(() => {
      string("Vui lòng nhập một chuỗi").parser(5);
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "string",
          receivedType: "number",
          message: "Vui lòng nhập một chuỗi",
        }),
      ]).message
    );
  });

  test("custom error builder", () => {
    expect(() => {
      string(
        ({ expectedType, receivedType }) =>
          `Thay vì nhập ${receivedType}, hãy nhập một ${expectedType}`
      ).parser(5);
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "string",
          receivedType: "number",
          message: "Thay vì nhập number, hãy nhập một string",
        }),
      ]).message
    );
  });
});

describe("string max length", () => {
  const name = string().max(5);

  test("valid length", () => {
    const pass = name.parser("abcd");
    expect(pass).toEqual("abcd");
  });

  test("invalid type", () => {
    expect(() => {
      name.parser(5);
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "string",
          receivedType: "number",
        }),
      ]).message
    );
  });

  test("invalid length", () => {
    expect(() => {
      name.parser("abcdefgh");
    }).toThrowError(
      new ErrorSet([
        new TooBigError({
          expectedSize: 5,
          receivedSize: 8,
        }),
      ]).message
    );
  });

  test("custom error string", () => {
    expect(() => {
      string()
        .max(5, "Vui lòng nhập một chuỗi bé hơn hoặc bằng 5")
        .parser("abcdefgh");
    }).toThrowError(
      new ErrorSet([
        new TooBigError({
          expectedSize: 5,
          receivedSize: 8,
          message: "Vui lòng nhập một chuỗi bé hơn hoặc bằng 5",
        }),
      ]).message
    );
  });
});

describe("string min length", () => {
  const name = string().min(5);

  test("valid length", () => {
    const pass = name.parser("abcdefgh");
    expect(pass).toEqual("abcdefgh");
  });

  test("invalid length", () => {
    expect(() => {
      name.parser("abc");
    }).toThrowError(
      new ErrorSet([
        new TooSmallError({
          expectedSize: 5,
          receivedSize: 3,
        }),
      ]).message
    );
  });

  test("custom error string", () => {
    expect(() => {
      string()
        .min(5, "Vui lòng nhập một chuỗi lớn hơn hoặc bằng 5")
        .parser("abc");
    }).toThrowError(
      new ErrorSet([
        new TooSmallError({
          expectedSize: 5,
          receivedSize: 3,
          message: "Vui lòng nhập một chuỗi lớn hơn hoặc bằng 5",
        }),
      ]).message
    );
  });
});
