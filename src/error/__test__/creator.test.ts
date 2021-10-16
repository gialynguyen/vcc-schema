import { ErrorSet } from '../errorSet';
import { ErrorSubject } from '../errorSubject';

describe("Error Creator", () => {
  describe("ErrorSubject", () => {
    const subject = new ErrorSubject({
      code: "invalid_type",
      message: "Invalid Type",
      paths: [],
    });

    it("Should have instance of ErrorSubject", () => {
      expect(subject).toBeInstanceOf(ErrorSubject);
    });

    describe("ErrorSubject without prerequisite property", () => {
      const subject = new ErrorSubject({
        code: "invalid_type",
        message: "Invalid Type",
        paths: [],
      });

      it("The prerequisite property should be false", () => {
        expect(subject.error.prerequisite).toBeFalsy();
      });
    });

    describe("ErrorSubject with prerequisite property", () => {
      const subject = new ErrorSubject({
        code: "invalid_type",
        message: "Invalid Type",
        paths: [],
        prerequisite: true,
      });

      it("The prerequisite property should be true", () => {
        expect(subject.error.prerequisite).toBeTruthy();
      });
    });
  });

  describe("ErrorSet", () => {
    const invalidError = new ErrorSubject({
      code: "invalid_type",
      message: "Invalid Type",
      paths: [],
    });

    it("Should have instance of ErrorSet", () => {
      const subject = new ErrorSet([]);
      expect(subject).toBeInstanceOf(ErrorSet);
      expect(subject.isEmpty).toBeTruthy();

      subject.addError(invalidError);
      expect(subject.isEmpty).toBeFalsy();
      expect(subject.errors.length).toBe(1);
      expect(subject.message).toEqual(
        `1 issue(s) has found\n\n   Error 1: invalid_type \n   Invalid Type\n`
      );

      subject.addErrors();
      expect(subject.errors.length).toBe(1);

      subject.addErrors([
        new ErrorSubject({
          code: "no_empty",
          message: "No Empty",
          paths: ["someProperty", 1],
        }),
      ]);
      expect(subject.errors.length).toBe(2);
      expect(subject.format()).not.toEqual(`{}`);
    });

    it("Should constructuring without Object's setPrototypeOf", () => {
      Object.defineProperty(Object, "setPrototypeOf", {
        writable: true,
        value: null,
      });
      const subject = new ErrorSet([]);
      expect(!!Object.setPrototypeOf).toBeFalsy();
      expect(subject).toBeInstanceOf(ErrorSet);
    });
  });
});
