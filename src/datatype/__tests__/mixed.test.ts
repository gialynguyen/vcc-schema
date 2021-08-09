import { mixed, MixedType, string, StringType, number, array } from "../";
import {
  ErrorSet,
  InvalidTypeError,
  InvalidFieldError,
  TooBigError,
} from "../../error";

describe("DataType Mixed", () => {
  const subject = mixed({
    name: string(),
    age: number(),
    company: mixed({
      name: string(),
      desc: string().optional(),
    }),
  });

  it("should have instance of MixedType", () => {
    const mixedValue = {
      name: "Người Da Màu",
      age: 24,
      company: { name: "3dacam" },
    };
    expect(subject).toBeInstanceOf(MixedType);
    expect(subject.children["name"]).toBeInstanceOf(StringType);
    expect(subject.parser(mixedValue)).toEqual(mixedValue);
    expect(
      subject.parser({ age: 24 }, { tryParser: true, paths: [] }).name
    ).toBeUndefined();
    expect(
      subject.parser(
        { age: 20, company: {} },
        { deepTryParser: true, tryParser: true, paths: [] }
      ).company.name
    ).toBeUndefined();
  });

  describe("with errors", () => {
    it("should throw an InvalidTypeError error", () => {
      const subject = mixed(
        {
          name: string(),
        },
        { error: "The value must be an object" }
      );

      try {
        subject.parser(null);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
        expect(err.errors[0].error.message).toEqual(
          "The value must be an object"
        );
      }
    });

    it("should throw an InvalidFieldError error", () => {
      const subject = mixed({
        name: string(),
      });

      try {
        subject.parser({ age: 24 });
      } catch (err) {
        expect(err.errors[0]).toBeInstanceOf(InvalidFieldError);
      }
    });
  });

  describe("pick", () => {
    it("should have instance of MixedType", () => {
      const pickSubject = subject.pick(["name"]);
      expect(pickSubject).toBeInstanceOf(MixedType);
      expect(pickSubject.parser({ name: "pick" })["name"]).toEqual("pick");
      expect(Object.keys(pickSubject.parser({ name: "pick" })).length).toBe(1);
      expect(Object.values(pickSubject.parser({ name: "pick" }))[0]).toBe(
        "pick"
      );
    });
  });

  describe("pickBy", () => {
    it("should have instance of MixedType", () => {
      const pickSubject = subject.pickBy({
        name: true,
      });

      expect(pickSubject).toBeInstanceOf(MixedType);

      const parsedResult = pickSubject.parser({ name: "pick" });

      expect(parsedResult.name).toEqual("pick");
      expect(Object.keys(parsedResult).length).toBe(1);
      expect(Object.values(parsedResult)[0]).toBe("pick");

      const pickedNestedSubject = subject.pickBy({
        name: true,
        company: {
          name: true,
        },
      });

      expect(pickedNestedSubject).toBeInstanceOf(MixedType);

      const pickedNestedResult = pickedNestedSubject.parser({
        name: "pick",
        company: { name: "VCCorp" },
      });

      expect(pickedNestedResult.name).toEqual("pick");
      expect(pickedNestedResult.company.name).toEqual("VCCorp");
      expect(Object.keys(pickedNestedResult).length).toBe(2);
      expect(Object.keys(pickedNestedResult.company).length).toBe(1);
    });
  });

  describe("omit", () => {
    it("should have instance of MixedType", () => {
      const omitSubject = subject.omit(["name"]);
      expect(omitSubject).toBeInstanceOf(MixedType);

      const pastedResult = omitSubject.parser({
        age: 24,
        company: { name: "3dacam" },
      });

      expect(pastedResult.age).toBe(24);
      expect(Reflect.get(pastedResult, "name")).toBe(undefined);
    });
  });

  describe("omitBy", () => {
    it("should have instance of MixedType", () => {
      const omitSubject = subject.omitBy({
        name: true,
      });

      expect(omitSubject).toBeInstanceOf(MixedType);

      const pastedResult = omitSubject.parser({
        age: 24,
        company: { name: "3dacam" },
      });

      expect(pastedResult["age"]).toBe(24);

      expect(Reflect.get(pastedResult, "name")).toBe(undefined);

      const omittedNestedSubject = subject.omitBy({
        name: true,
        age: false,
        company: {
          name: true,
        },
      });

      expect(omittedNestedSubject).toBeInstanceOf(MixedType);

      const pastedNestedResult = omittedNestedSubject.parser({
        age: 24,
        company: {
          desc: "A company of finance",
        },
      });

      expect(Object.keys(pastedNestedResult).length).toBe(2);
      expect(Object.keys(pastedNestedResult.company).length).toBe(1);
      expect(Reflect.get(pastedNestedResult, "name")).toBe(undefined);
    });
  });

  describe("modify", () => {
    it("should have instance of MixedType", () => {
      const modifySubject = subject.modify({ age: (age) => age.max(7) });
      expect(modifySubject).toBeInstanceOf(MixedType);
      expect(
        modifySubject.parser({
          name: "modify",
          age: 7,
          company: { name: "3dacam" },
        })["age"]
      ).toBe(7);

      try {
        modifySubject.parser({
          name: "modify",
          age: 24,
          company: { name: "3dacam" },
        });
      } catch (err) {
        expect(err.errors[0]).toBeInstanceOf(TooBigError);
      }
    });
  });

  describe("pickAndModify", () => {
    it("should have instance of MixedType", () => {
      const pickAndModifySubject = subject.pickAndModify({
        name: true,
        age: (age) => age.max(7),
      });

      const parsedResult = pickAndModifySubject.parser({
        age: 7,
        name: "VCCorp",
      });

      expect(pickAndModifySubject).toBeInstanceOf(MixedType);
      expect(parsedResult.age).toBe(7);
      expect(parsedResult.name).toBe("VCCorp");
      expect(pickAndModifySubject).not.toContain("company");

      try {
        pickAndModifySubject.parser({ age: 24, name: "VCCorp" });
      } catch (err) {
        expect(err.errors[0]).toBeInstanceOf(TooBigError);
      }
    });
  });

  describe("strict", () => {
    it("should have instance of MixedType", () => {
      const strictSubject = subject.strict(false);
      expect(strictSubject).toBeInstanceOf(MixedType);
    });

    it("should throw an InvalidFieldError error", () => {
      const strictSubject = subject.strict(true);
      try {
        strictSubject.parser({ major: "Software engineer" });
      } catch (err) {
        expect(err.errors[0]).toBeInstanceOf(InvalidFieldError);
      }
    });
  });

  describe("extends", () => {
    it("should have instance of MixedType", () => {
      const extendsSubject = subject.extends({
        name: number(),
        routines: array(string()),
      });
      expect(extendsSubject).toBeInstanceOf(MixedType);
      expect(extendsSubject.children.routines).not.toBeUndefined();
    });

    it("should throw an InvalidTypeError error", () => {
      const extendsSubject = subject.extends({
        name: number(),
        routines: array(string()),
      });
      try {
        extendsSubject.parser({
          name: 17,
          age: 24,
          company: { name: "3dacam" },
          routines: ["drink coffee"],
        });
      } catch (err) {
        expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
      }
    });
  });
});
