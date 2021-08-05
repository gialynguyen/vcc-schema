import { tuples, TuplesType, boolean, string, number } from "../";
import { ErrorSet, IncorrectSizeError, InvalidTypeError } from "../../error";

describe("Datatype Tuples", () => {
  const subject = tuples([boolean(), number(), string()]);

  it("should have instance of TuplesType", () => {
    expect(subject).toBeInstanceOf(TuplesType);
    expect(subject.parser([true, 1, "one"])).toEqual([true, 1, "one"]);
    expect(subject.tryParser([true, 1])).toEqual([true, 1, undefined]);
  });

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
  });

  it("should throw an IncorrectSizeError error", () => {
    try {
      subject.parser([true, 1, "one", false]);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(IncorrectSizeError);
    }
  });
});
