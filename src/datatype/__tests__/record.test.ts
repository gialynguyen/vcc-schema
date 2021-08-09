import { string, record, RecordType, tuples, number, array } from "../";
import { ErrorSet, IncorrectSizeError, InvalidTypeError } from "../../error";

describe("Datatype Record", () => {
  const subject = record(string());

  it("should have instance of RecordType", () => {
    expect(subject).toBeInstanceOf(RecordType);
    expect(
      subject.parser({
        1: "Tom",
        2: "Lyn",
      })
    ).toEqual({
      1: "Tom",
      2: "Lyn",
    });

    expect(
      subject.parser(undefined, { tryParser: true, deepTryParser: true })
    ).toEqual(undefined);
  });

  it("nested schema", () => {
    const recordSchema = record(record(tuples([number(), array(string())])));

    expect(
      recordSchema.tryDeepParser({
        demo: {
          nested: ["Jack", ["Tom"]],
        },
      })
    ).toEqual({
      demo: {
        nested: [undefined, ["Tom"]],
      },
    });
  });
});

describe("Datatype Record Error", () => {
  const subject = record(string());

  it("should throw an InvalidTypeError error", () => {
    try {
      subject.parser(null);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }

    try {
      subject.parser([]);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }

    try {
      subject.strictParser({
        demo: 3,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });

  it("should throw an InvalidTypeError error with nested schema type", () => {
    const recordSchema = record(record(tuples([number(), array(string())])));

    try {
      recordSchema.parser({
        demo: {
          nested: [3, ["Tom"]],
        },
      });
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });

  it("Custom Error Message", () => {
    const subject = record(string(), {
      error: "Please input a record of string",
    });

    try {
      subject.strictParser([]);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
      expect(err.errors[0].error.message).toEqual(
        "Please input a record of string"
      );
    }
  });
});
