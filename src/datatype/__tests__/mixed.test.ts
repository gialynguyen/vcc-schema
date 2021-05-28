// @ts-ignore TS6133
import { expect, test } from "@jest/globals";
import { string, mixed } from "../";

import { ErrorSet, InvalidTypeError } from "../../error";

describe("mixed type", () => {
  const customer = mixed({
    name: string(),
  });

  test("valid type", () => {
    const pass = customer.parser({
      name: "Gialynguyen",
    });

    expect(pass).toEqual({
      name: "Gialynguyen",
    });
  });

  test("invalid type", () => {
    expect(() => {
      customer.parser(5);
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "mixed",
          receivedType: "number",
        }),
      ]).message
    );
  });

  test("invalid property type", () => {
    expect(() => {
      customer.parser({
        name: 1,
      });
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "string",
          receivedType: "number",
          paths: ["name"],
        }),
      ]).message
    );
  });
});

describe("nested mixed type", () => {
  const customer = mixed({
    profile: mixed({
      name: string(),
    }),
  });

  test("valid type", () => {
    const pass = customer.parser({
      profile: {
        name: "Gialynguyen",
      },
    });
    expect(pass).toEqual({
      profile: {
        name: "Gialynguyen",
      },
    });
  });

  test("invalid type", () => {
    expect(() => {
      customer.parser(5);
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "mixed",
          receivedType: "number",
        }),
      ]).message
    );
  });

  test("invalid property type", () => {
    expect(() => {
      customer.parser({
        profile: {
          name: 1,
        },
      });
    }).toThrowError(
      new ErrorSet([
        new InvalidTypeError({
          expectedType: "string",
          receivedType: "number",
          paths: ["profile", "name"],
        }),
      ]).message
    );
  });
});

// TODO: Implement testing for Omit, Pick, ...
