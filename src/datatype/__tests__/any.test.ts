import { any, AnyType } from "../";
import { ErrorSet, InvalidTypeError } from "../../error";

describe("DataType Any", () => {
  const subject = any();

  it("should have instance of AnyType", () => {
    expect(subject).toBeInstanceOf(AnyType);
    expect(subject.parser(1)).toBe(1);
  });

  it("should throw an InvalidTypeError error", () => {
    try {
      subject.parser(null);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });
});
