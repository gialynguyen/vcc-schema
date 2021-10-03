import { Types } from "../../datatype";
import {
  IncorrectSizeError,
  InvalidFieldError,
  InvalidStringFormat,
  InvalidTypeError,
  InvalidUnionTypeError,
  NoEqualError,
  TooBigError,
  TooSmallError,
} from "../errors";

describe("Error Errors", () => {
  describe("InvalidTypeError", () => {
    it("Should have instance of InvalidTypeError", () => {
      InvalidTypeError.setDefaultMessage =
        "Set the default message from outside";
      const subject = new InvalidTypeError({
        expectedType: Types.string,
        receivedType: Types.number,
      });

      expect(InvalidTypeError.is(subject)).toBeTruthy();
      expect(subject.error.message).toEqual(
        "Set the default message from outside"
      );
    });

    describe("Without default message", () => {
      const subject = new InvalidTypeError({
        expectedType: Types.string,
        receivedType: Types.number,
      });
      expect(subject.error.message).toEqual(
        `Expected ${Types.string}, received ${Types.number}`
      );
    });

    describe("With default message", () => {
      const subject = new InvalidTypeError({
        expectedType: Types.string,
        receivedType: Types.number,
        message: "Default message",
      });
      expect(subject.error.message).toEqual("Default message");
    });
  });

  describe("InvalidUnionTypeError", () => {
    const expectedType = [Types.string, Types.number];
    const receivedType = Types.null;

    it("Should have instance of InvalidUnionTypeError", () => {
      InvalidUnionTypeError.setDefaultMessage =
        "Set the default message from outside";
      const subject = new InvalidUnionTypeError({ expectedType, receivedType });

      expect(InvalidUnionTypeError.is(subject)).toBeTruthy();
      expect(subject.error.message).toEqual(
        "Set the default message from outside"
      );
    });

    describe("Without default message", () => {
      const subject = new InvalidUnionTypeError({ expectedType, receivedType });
      expect(subject.error.message).toEqual(
        `Expected ${InvalidUnionTypeError.joinExpectedType(
          expectedType
        )}, received ${receivedType}`
      );
    });

    describe("With default message", () => {
      const message = "The value must be of type string and number";
      const subject = new InvalidUnionTypeError({
        expectedType,
        receivedType,
        message,
      });
      expect(subject.error.message).toEqual(message);
    });
  });

  describe("TooSmallError", () => {
    const expectedSize = 7;
    const receivedSize = 5;

    it("Should have instance of TooSmallError", () => {
      TooSmallError.setDefaultMessage = "Set the default message from outside";
      const subject = new TooSmallError({ expectedSize, receivedSize });

      expect(TooSmallError.is(subject)).toBeTruthy();
      expect(subject.error.message).toEqual(
        "Set the default message from outside"
      );
    });

    describe("Without default message", () => {
      const subject = new TooSmallError({ expectedSize, receivedSize });
      expect(subject.error.message).toEqual(
        `Length must be greater than ${expectedSize}, but received ${receivedSize}`
      );
    });

    describe("With default message", () => {
      const message = `The value must be equal to or greater than ${expectedSize}`;
      const subject = new TooSmallError({
        expectedSize,
        receivedSize,
        message,
      });
      expect(subject.error.message).toEqual(message);
    });
  });

  describe("TooBigError", () => {
    const expectedSize = 7;
    const receivedSize = 9;

    it("Should have instance of TooBigError", () => {
      TooBigError.setDefaultMessage = "Set the default message from outside";
      const subject = new TooBigError({ expectedSize, receivedSize });

      expect(TooBigError.is(subject)).toBeTruthy();
      expect(subject.error.message).toEqual(
        "Set the default message from outside"
      );
    });

    describe("Without default message", () => {
      const subject = new TooBigError({ expectedSize, receivedSize });
      expect(subject.error.message).toEqual(
        `Length must be less than ${expectedSize}, but received ${receivedSize}`
      );
    });

    describe("With default message", () => {
      const message = `The value must be equal to or less than ${expectedSize}`;
      const subject = new TooBigError({ expectedSize, receivedSize, message });
      expect(subject.error.message).toEqual(message);
    });
  });

  describe("IncorrectSizeError", () => {
    const expectedSize = 7;
    const receivedSize = 9;

    it("Should have instance of IncorrectSizeError", () => {
      IncorrectSizeError.setDefaultMessage =
        "Set the default message from outside";
      const subject = new IncorrectSizeError({ expectedSize, receivedSize });

      expect(IncorrectSizeError.is(subject)).toBeTruthy();
      expect(subject.error.message).toEqual(
        "Set the default message from outside"
      );
    });

    describe("Without default message", () => {
      const subject = new IncorrectSizeError({ expectedSize, receivedSize });
      expect(subject.error.message).toEqual(
        `Length must be equal ${expectedSize}, but received ${receivedSize}`
      );
    });

    describe("With default message", () => {
      const message = `The value must be equal to ${expectedSize}`;
      const subject = new IncorrectSizeError({
        expectedSize,
        receivedSize,
        message,
      });
      expect(subject.error.message).toEqual(message);
    });
  });

  describe("NoEqualError", () => {
    const expectedValue = 7;
    const receivedValue = 9;

    it("Should have instance of NoEqualError", () => {
      NoEqualError.setDefaultMessage = "Set the default message from outside";
      const subject = new NoEqualError({ expectedValue, receivedValue });

      expect(NoEqualError.is(subject)).toBeTruthy();
      expect(subject.error.message).toEqual(
        "Set the default message from outside"
      );
    });

    describe("Without default message", () => {
      const subject = new NoEqualError({ expectedValue, receivedValue });
      expect(subject.error.message).toEqual(
        `Value must be equal ${expectedValue}, but received ${receivedValue}`
      );
    });

    describe("With default message", () => {
      const message = `The value must be equal to ${expectedValue}`;
      const subject = new NoEqualError({
        expectedValue,
        receivedValue,
        message,
      });
      expect(subject.error.message).toEqual(message);
    });
  });

  describe("InvalidFieldError", () => {
    const paths = ["invalidFieldError", "fieldErrorKey"];
    const invalidFieldPaths = "fieldErrorKey";

    it("Should have instance of InvalidFieldError", () => {
      InvalidFieldError.setDefaultMessage =
        "Set the default message from outside";
      const subject = new InvalidFieldError({ paths, invalidFieldPaths });

      expect(InvalidFieldError.is(subject)).toBeTruthy();
      expect(subject.invalidFieldPaths).toEqual(invalidFieldPaths);
      expect(subject.error.message).toEqual(
        "Set the default message from outside"
      );
    });

    describe("Without default message", () => {
      const subject = new InvalidFieldError({ invalidFieldPaths });
      expect(subject.error.message).toEqual(
        `${invalidFieldPaths} is an invalid field`
      );
    });

    describe("With default message", () => {
      const message = `Invalid field at property ${invalidFieldPaths}`;
      const subject = new InvalidFieldError({
        paths,
        invalidFieldPaths,
        message,
      });
      expect(subject.error.message).toEqual(message);
    });
  });

  describe("InvalidStringFormat", () => {
    const receivedString = "thisvalueisnotanemail";

    it("Should have instance of InvalidStringFormat", () => {
      InvalidStringFormat.setDefaultMessage =
        "Set the default message from outside";
      const subject = new InvalidStringFormat({ receivedString });

      expect(InvalidStringFormat.is(subject)).toBeTruthy();
      expect(subject.error.message).toEqual(
        "Set the default message from outside"
      );
    });

    describe("With formatName", () => {
      const subject = new InvalidStringFormat({ receivedString });
      expect(subject.error.message).toEqual(
        `${receivedString} is not a valid string`
      );
    });

    describe("Without default message", () => {
      const subject = new InvalidStringFormat({
        receivedString,
        formatName: "email",
      });
      expect(subject.error.message).toEqual(
        `${receivedString} is not a valid email`
      );
    });

    describe("With default message", () => {
      const message = `${receivedString} value is not an email`;
      const subject = new InvalidStringFormat({ receivedString, message });
      expect(subject.error.message).toEqual(message);
    });
  });
});
