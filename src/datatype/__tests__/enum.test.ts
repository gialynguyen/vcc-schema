import { enumType, EnumType } from "..";
import { ErrorSet, InvalidTypeError } from "../../error";

describe("DataType Enum", () => {
  const subject = enumType(["Male", "Female"]);

  it("should have instance of EnumType", () => {
    expect(subject).toBeInstanceOf(EnumType);
    expect(subject.parser("Male")).toBe("Male");
    expect(subject.get("Male")).toBe("Male");
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
