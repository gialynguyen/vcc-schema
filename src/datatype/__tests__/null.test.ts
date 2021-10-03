import { nullable, NullType } from "../";
import { ErrorSet, InvalidTypeError } from "../../error";

describe("DataType Null", () => {
  const subject = nullable();

  it("should have instance of NullType", () => {
    expect(subject).toBeInstanceOf(NullType);
    expect(subject.parser(null)).toBeNull();
  });

  it("should throw an InvalidTypeError error", () => {
    try {
      subject.parser(false);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });
});
