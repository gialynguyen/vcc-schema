import { array, boolean, number, string, tuples, TuplesType } from "../";
import { ErrorSet, IncorrectSizeError, InvalidTypeError } from "../../error";

describe("Datatype Tuples", () => {
  const subject = tuples([boolean(), number(), string(), array(number())]);

  it("should have instance of TuplesType", () => {
    expect(subject).toBeInstanceOf(TuplesType);
    expect(subject.parser([true, 1, "one", [1, 2]])).toEqual([
      true,
      1,
      "one",
      [1, 2],
    ]);
    expect(
      subject.parser([true, 1], { tryParser: true, deepTryParser: true })
    ).toEqual([true, 1, undefined, undefined]);
  });
});

describe("Datatype Tuples Error", () => {
  const subject = tuples([boolean(), number(), string(), array(number())]);

  it("should throw an InvalidTypeError error", () => {
    try {
      subject.parser(null);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }

    try {
      subject.parser([false, 1]);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }

    try {
      subject.strictParser([true, 1, "one", ["gialynguyen", 2]], {
        tryParser: true,
        deepTryParser: true,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });

  it("should throw an IncorrectSizeError error", () => {
    try {
      subject.parser([true, 1, "one", [1, 2], true]);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(IncorrectSizeError);
    }

    try {
      subject.strictParser([true, "two", 1]);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors.length).toEqual(1);
    }
  });

  it("Custom Error Message", () => {
    const subjectWithErrorCustomize = tuples([boolean(), number(), string()], {
      error: (err) => {
        if (err.instance === IncorrectSizeError) {
          return "Invalid tuples size";
        }

        return "Invalid tuples";
      },
    });

    try {
      subjectWithErrorCustomize.parser([true, 1, "one", false]);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(IncorrectSizeError);
      expect(err.errors[0].error.message).toEqual("Invalid tuples size");
    }

    try {
      subjectWithErrorCustomize.parser("gialynguyen");
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
      expect(err.errors[0].error.message).toEqual("Invalid tuples");
    }
  });
});
