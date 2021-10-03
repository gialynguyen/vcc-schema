import { array, ArrayType, string } from "../";
import {
  ErrorSet,
  IncorrectSizeError,
  InvalidTypeError,
  TooBigError,
  TooSmallError,
} from "../../error";

describe("DataType Array", () => {
  const subject = array(string());

  it("should have instance of ArrayType", () => {
    expect(subject).toBeInstanceOf(ArrayType);

    const dataParser = ["1"];
    expect(subject.parser(dataParser)).toEqual(dataParser);
  });

  it("should throw an InvalidTypeError error", () => {
    try {
      subject.parser(null);
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });

  it("should throw an InvalidTypeError error when given a deepTryParser", () => {
    const subject = array(string());

    try {
      subject.parser(["deepTryParser", 1], { deepTryParser: true, paths: [] });
    } catch (err) {
      expect(err).toBeInstanceOf(ErrorSet);
      expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });

  describe("NoEmpty", () => {
    const subject = array(string()).nonempty();
    expect(subject).toBeInstanceOf(ArrayType);
    expect(subject.parser(["1"]).length).toBeGreaterThan(0);

    it("should throw a TooSmallError error", () => {
      try {
        subject.parser(subject.parser([]));
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(TooSmallError);
      }
    });
  });

  describe("Length", () => {
    const subject = array(string()).length(5);
    expect(subject).toBeInstanceOf(ArrayType);
    expect(subject.parser(["1", "2", "3", "4", "5"]).length).toEqual(5);

    it("should throw a IncorrectSizeError error", () => {
      try {
        subject.parser(subject.parser([]));
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(IncorrectSizeError);
      }
    });

    it("should throw a IncorrectSizeError error", () => {
      try {
        subject.parser(subject.parser(["1", "2", "3", "4", "5", "6", "7"]));
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(IncorrectSizeError);
      }
    });
  });

  describe("MinLength", () => {
    const subject = array(string()).min(5);
    expect(subject).toBeInstanceOf(ArrayType);
    expect(subject.parser(["1", "2", "3", "4", "5", "6"]).length).toEqual(6);

    it("should throw a TooSmallError error", () => {
      try {
        subject.parser(subject.parser(["1", "2"]));
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(TooSmallError);
      }
    });
  });

  describe("MaxLength", () => {
    const subject = array(string()).max(5);
    expect(subject).toBeInstanceOf(ArrayType);
    expect(subject.parser(["1", "2", "3"]).length).toEqual(3);

    it("should throw a TooBigError error", () => {
      try {
        subject.parser(subject.parser(["1", "2", "3", "4", "5"]));
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(TooBigError);
      }
    });
  });

  describe("DefaultValue", () => {
    const subject = array(string()).default([]);
    expect(subject).toBeInstanceOf(ArrayType);
    expect(subject.parser(["1", "2", "3"]).length).toEqual(3);
    expect(subject.parser(undefined).length).toEqual(0);
  });
});
