import { number, NumberType } from "../";
import {
  ErrorSet,
  InvalidTypeError,
  NoEqualError,
  TooBigError,
  TooSmallError,
} from "../../error";

describe("DataType Null", () => {
  const subject = number();

  it("should have instance of NumberType", () => {
    expect(subject).toBeInstanceOf(NumberType);
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

  describe("Max", () => {
    const subject = number().max(7);
    expect(subject).toBeInstanceOf(NumberType);
    expect(subject.parser(6)).toBe(6);

    it("should throw a TooBigError type", () => {
      try {
        subject.parser(10);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(TooBigError);
      }
    });
  });

  describe("Min", () => {
    const subject = number().min(7);
    expect(subject).toBeInstanceOf(NumberType);
    expect(subject.parser(10)).toBe(10);

    it("should throw a TooSmallError type", () => {
      try {
        subject.parser(6);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(TooSmallError);
      }
    });
  });

  describe("Equal", () => {
    const subject = number().equal(7);
    expect(subject).toBeInstanceOf(NumberType);
    expect(subject.parser(7)).toBe(7);

    it("should throw a NoEqualError type", () => {
      try {
        subject.parser(6);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(NoEqualError);
      }
    });
  });
});
