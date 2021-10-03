import { number, oneOf, OneOfType, string } from "../";
import { ErrorSet, InvalidUnionTypeError } from "../../error";

describe("DataType oneOf", () => {
  it("should have instance of OneOfType", () => {
    const subject = oneOf([string(), number()]);
    expect(subject).toBeInstanceOf(OneOfType);
    expect(subject.parser(1)).toBe(1);
  });

  describe("must have an error", () => {
    it("should throw an InvalidUnionTypeError error", () => {
      const subject = oneOf([string(), number()]);
      try {
        subject.parser(null);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(InvalidUnionTypeError);
      }
    });

    it("Should throw an error when its error does not have an invalid type", () => {
      const subject = oneOf([number().max(7)]);
      try {
        subject.parser(10);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).not.toBeInstanceOf(InvalidUnionTypeError);
      }
    });

    it("Should throw an error with default error message when its error does not have an invalid type", () => {
      const defaultErrorMessage =
        "The value must be of type number and maximum value is 7";
      const subject = oneOf([number().max(7)], defaultErrorMessage);
      try {
        subject.parser(10);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(InvalidUnionTypeError);
        expect(err.errors[0].error.message).toEqual(defaultErrorMessage);
      }
    });
  });
});
