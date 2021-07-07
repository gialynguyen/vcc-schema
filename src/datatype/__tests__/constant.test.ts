import { constant, ConstantType } from "..";
import { ErrorSet, InvalidTypeError } from "../../error";

describe("DataType Constant", () => {
  const subject = constant("ConstantType");

  it("should have instance of ConstantType", () => {
    expect(subject).toBeInstanceOf(ConstantType);
    expect(subject.parser("ConstantType")).toBe("ConstantType");
  });

  it("should throw an InvalidTypeError error", () => {
    try {
      subject.parser(3);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });

  it("should throw an InvalidTypeError error", () => {
    try {
      subject.parser(null);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });

  it("should throw an InvalidTypeError error", () => {
    try {
      subject.parser(undefined);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });
});
