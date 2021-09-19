import { func, FuncType } from "../";
import { ErrorSet, InvalidTypeError } from "../../error";

describe("DataType Function", () => {
  const subject = func();

  it("should have instance of FuncType", () => {
    expect(subject).toBeInstanceOf(FuncType);
    expect(subject.parser(() => {})).toBeInstanceOf(Function);
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
